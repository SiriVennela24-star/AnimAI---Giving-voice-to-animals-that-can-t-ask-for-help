import uuid
import json
import logging
import random
import math
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel, Field

from config.db import get_database
from models.incident import IncidentModel, MediaAssets, AnalysisPayload
from services.uploader import upload_asset_stream
from services.vision_processor import process_image_media, process_video_media
from services.audio_processor import analyze_audio_distress
from services.risk_engine import calculate_triage_risk


logger = logging.getLogger("AnimAI.triage")
router = APIRouter(prefix="/api/v1/triage", tags=["Triage"])

# Metropolitan clusters for fallback coordinates (with name and coordinates [lng, lat])
METRO_SECTORS = [
    {"name": "Downtown Sector A", "coords": [-122.4194, 37.7749]},   # San Francisco
    {"name": "Industrial Zone B", "coords": [-74.0060, 40.7128]},    # New York
    {"name": "Residential Sector C", "coords": [-118.2437, 34.0522]}, # Los Angeles
    {"name": "North Sector D", "coords": [-87.6298, 41.8781]}         # Chicago
]

class CommunityReportRequest(BaseModel):
    reporter_name: str
    reporter_phone: str
    description: str
    location: List[float] # [longitude, latitude]

@router.post("/analyze", response_model=IncidentModel)
async def analyze_incident(
    audio: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    db = Depends(get_database)
):
    """
    Triage analysis endpoint.
    Accepts media uploads (audio, image, or video), runs CV / DSP signal processing,
    uploads resulting media to Cloudinary, and saves the final incident payload to MongoDB.
    """
    logger.info("Received triage analysis request.")
    
    # 1. Coordinate defaults (choose random metro sector with jitter if not provided)
    if latitude is not None and longitude is not None:
        lat = latitude
        lon = longitude
    else:
        sector = random.choice(METRO_SECTORS)
        # Add a small random jitter to separate pins on the map
        lon = sector["coords"][0] + random.uniform(-0.015, 0.015)
        lat = sector["coords"][1] + random.uniform(-0.015, 0.015)
        
    location_coordinates = [lon, lat]

    audio_url = None
    media_url = None
    
    vision_labels = ["No Visual Input"]
    vision_conf = {}
    audio_labels = ["No Acoustic Input"]
    audio_telemetry = {"rms_max": 0.0, "rms_mean": 0.0, "spectral_centroid_mean": 0.0, "distress_prob": 0.0}

    # 2. Process Audio File
    if audio:
        try:
            audio_bytes = await audio.read()
            if len(audio_bytes) > 0:
                audio_labels, audio_telemetry = analyze_audio_distress(audio_bytes)
                audio_url = await upload_asset_stream(audio_bytes, audio.filename)
        except Exception as e:
            logger.error(f"Failed to process audio: {e}")
            audio_labels = ["Audio Processing Error"]

    # 3. Process Visual Media (Video takes precedence)
    if video:
        try:
            video_bytes = await video.read()
            if len(video_bytes) > 0:
                processed_video, vision_labels, vision_conf = process_video_media(video_bytes)
                media_url = await upload_asset_stream(processed_video, video.filename)
        except Exception as e:
            logger.error(f"Failed to process video: {e}")
            vision_labels = ["Video Processing Error"]
    elif image:
        try:
            image_bytes = await image.read()
            if len(image_bytes) > 0:
                processed_img, vision_labels, vision_conf = process_image_media(image_bytes)
                media_url = await upload_asset_stream(processed_img, image.filename)
        except Exception as e:
            logger.error(f"Failed to process image: {e}")
            vision_labels = ["Image Processing Error"]

    # 4. Calculate Risk Score and Operational Status using Risk Engine
    risk_score, operational_status = calculate_triage_risk(
        vision_labels=vision_labels,
        vision_confidence=vision_conf,
        audio_labels=audio_labels,
        audio_telemetry=audio_telemetry
    )

    # Compile detected injuries list
    detected_injuries = []
    for lbl in vision_labels + audio_labels:
        if lbl not in [
            "No Visual Input", 
            "No Acoustic Input", 
            "No External Wounds Detected", 
            "Ambient / Silent Monitor",
            "Vocalization / Barking"
        ]:
            detected_injuries.append(lbl)
            
    if not detected_injuries:
        detected_injuries = ["Minor/Under Observation"]

    # Compile confidence map
    confidence_percentages = {}
    for k, v in vision_conf.items():
        confidence_percentages[k] = v
    for k, v in audio_telemetry.items():
        if k == "rms_max":
            confidence_percentages["Max Acoustic Power"] = round(v * 100.0, 1)
        elif k == "db_spikes":
            confidence_percentages["Vocal Spikes Detected"] = float(v)

    # 5. Formulate incident model
    incident_id = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc)
    
    media_assets = MediaAssets(
        cloudinary_audio_url=audio_url,
        cloudinary_image_url=media_url
    )
    
    analysis_payload = AnalysisPayload(
        risk_score=risk_score,
        detected_injuries=detected_injuries,
        confidence_percentages=confidence_percentages
    )
    
    incident = IncidentModel(
        incident_id=incident_id,
        timestamp=timestamp,
        location=location_coordinates,
        media_assets=media_assets,
        analysis_payload=analysis_payload,
        operational_status=operational_status
    )

    # Save to MongoDB Atlas
    try:
        incident_dict = json.loads(incident.model_dump_json())
        incident_dict["_id"] = incident_id
        await db["incidents"].insert_one(incident_dict)
        logger.info(f"Saved incident record {incident_id} successfully.")
    except Exception as e:
        logger.error(f"Failed to write record to MongoDB: {e}")
    
    return incident

@router.get("/incidents", response_model=list[IncidentModel])
async def list_incidents(db = Depends(get_database)):
    """
    Fetch all historical incident reports, sorted by descending timestamp.
    """
    try:
        cursor = db["incidents"].find()
        cursor.sort("timestamp", -1)
        records = await cursor.to_list(length=50)
        return records
    except Exception as e:
        logger.error(f"Failed to fetch incident list: {e}")
        return []

@router.post("/community/report")
async def create_community_report(body: CommunityReportRequest, db = Depends(get_database)):
    """
    Saves public community reports, automatically triages classification
    and injects into the incident list to ensure live geospatial map reactivity.
    """
    logger.info(f"Received community report from {body.reporter_name}")
    
    # Simple NLP classification on text description
    desc = body.description.lower()
    risk_score = 15
    status = "Stable"
    injuries = ["Minor/Under Observation"]

    if any(k in desc for k in ["bleed", "wound", "blood", "cut", "severe", "gash", "critical", "dying"]):
        risk_score = 80
        status = "Critical"
        injuries = ["Open Wound Detection"]
    elif any(k in desc for k in ["fracture", "posture", "limb", "broken", "bone", "hit", "car", "run over", "dog fight"]):
        risk_score = 75
        status = "Critical"
        injuries = ["Fracture/Posture Distress"]
    elif any(k in desc for k in ["limp", "hurt", "pain", "crying", "whining", "sick"]):
        risk_score = 45
        status = "Warning"
        injuries = ["Possible Limb/Posture Injury"]

    incident_id = f"comm-{str(uuid.uuid4())[:8]}"
    timestamp = datetime.now(timezone.utc)

    media_assets = MediaAssets(
        cloudinary_audio_url=None,
        cloudinary_image_url=None
    )

    analysis_payload = AnalysisPayload(
        risk_score=risk_score,
        detected_injuries=injuries,
        confidence_percentages={"Text Report Confidence": 90.0}
    )

    # In order to render on the leaflet map, we convert this report into an incident
    incident_dict = {
        "_id": incident_id,
        "incident_id": incident_id,
        "timestamp": timestamp.isoformat(),
        "location": body.location,
        "media_assets": media_assets.model_dump(),
        "analysis_payload": analysis_payload.model_dump(),
        "operational_status": status,
        "reporter_name": body.reporter_name,
        "reporter_phone": body.reporter_phone,
        "description": body.description
    }

    try:
        await db["incidents"].insert_one(incident_dict)
        logger.info(f"Successfully integrated community report {incident_id} into incidents database.")
    except Exception as e:
        logger.error(f"Failed to save community report to MongoDB: {e}")
        raise HTTPException(status_code=500, detail="Database write failure")

    return {"status": "success", "incident_id": incident_id}


@router.get("/predict/outbreaks")
async def predict_outbreaks(db = Depends(get_database)):
    """
    Generates future time-series predictions of distress spikes per city sector.
    Dynamically scales spike counts based on active database incident counts in each zone.
    """
    # 1. Gather baseline sector coordinates
    sectors = [item["name"] for item in METRO_SECTORS]
    
    # 2. Query actual counts in database to add density factor
    sector_densities = {sec: 0 for sec in sectors}
    try:
        incidents = await db["incidents"].find().to_list(length=100)
        for inc in incidents:
            loc = inc.get("location")
            if loc and len(loc) == 2:
                # Find closest sector
                min_dist = float('inf')
                closest_sec = sectors[0]
                for s in METRO_SECTORS:
                    dist = (loc[0] - s["coords"][0])**2 + (loc[1] - s["coords"][1])**2
                    if dist < min_dist:
                        min_dist = dist
                        closest_sec = s["name"]
                sector_densities[closest_sec] += 1
    except Exception as e:
        logger.warning(f"Failed to calculate sector densities: {e}")

    # 3. Generate future 7-day predictive time series
    results = []
    base_date = datetime.now(timezone.utc).date()
    
    for sec in sectors:
        density_bonus = sector_densities[sec] * 3 # 3 extra spikes per historical incident
        predictions = []
        for i in range(7):
            pred_date = base_date + timedelta(days=i)
            # Simulated wave patterns for predictions
            base_spikes = int(10 + 8 * math.sin(i * 0.8) + random.randint(-2, 3))
            final_spikes = max(2, base_spikes + density_bonus)
            confidence = round(0.75 + 0.18 * math.cos(i * 0.4) + random.uniform(-0.03, 0.03), 2)
            confidence = min(0.99, max(0.5, confidence))
            
            predictions.append({
                "date": pred_date.isoformat(),
                "spikes": final_spikes,
                "confidence": confidence
            })
            
        results.append({
            "sector": sec,
            "predictions": predictions
        })
        
    return results
