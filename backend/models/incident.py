from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
from typing import List, Dict, Optional

class MediaAssets(BaseModel):
    cloudinary_audio_url: Optional[str] = None
    cloudinary_image_url: Optional[str] = None

class AnalysisPayload(BaseModel):
    risk_score: int = Field(..., ge=0, le=100)
    detected_anomalies: List[str] = Field(default_factory=list)
    detected_injuries: List[str] = Field(default_factory=list)  # Duplicate for frontend backward-compatibility
    confidence_percentages: Dict[str, float] = Field(default_factory=dict)

class IncidentCreate(BaseModel):
    location: List[float] = Field(..., min_length=2, max_length=2, description="[longitude, latitude]")
    media_assets: Optional[MediaAssets] = None
    analysis_payload: Optional[AnalysisPayload] = None
    operational_status: str = "Critical"

class IncidentModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={
            datetime: lambda dt: dt.isoformat()
        }
    )

    incident_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    location: List[float] = Field(..., min_length=2, max_length=2, description="[longitude, latitude]")
    media_assets: MediaAssets
    analysis_payload: AnalysisPayload
    operational_status: str = "Critical"
    reporter_name: Optional[str] = None
    reporter_phone: Optional[str] = None
    description: Optional[str] = None
