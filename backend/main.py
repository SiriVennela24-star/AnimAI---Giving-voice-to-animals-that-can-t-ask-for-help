import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

load_dotenv()

# Configure logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("AnimAI.main")

from config.db import get_database, is_mock, verify_database_connection
from routes.incidents import router as triage_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Initializing AnimAI backend services...")
    await verify_database_connection()
    db = get_database()
    
    # Check if database is empty, and seed high-fidelity mock data if so
    try:
        count = len(db["incidents"]._data) if is_mock else await db["incidents"].count_documents({})
        if count == 0:
            logger.info("Database empty. Seeding initial triage incidents for live dashboard visualization...")
            mock_incidents = [
                {
                    "_id": "seed-1",
                    "incident_id": "seed-1",
                    "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=15)).isoformat(),
                    "location": [-122.4194, 37.7749],  # San Francisco
                    "media_assets": {
                        "cloudinary_audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                        "cloudinary_image_url": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600"
                    },
                    "analysis_payload": {
                        "risk_score": 88,
                        "detected_injuries": ["Open Wound Detection", "Possible Leg Injury (Limping Pose)"],
                        "confidence_percentages": {
                            "Detection: Dog": 94.2,
                            "Wound Spot #1": 88.0,
                            "Max Acoustic Power": 85.0
                        }
                    },
                    "operational_status": "Critical"
                },
                {
                    "_id": "seed-2",
                    "incident_id": "seed-2",
                    "timestamp": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(),
                    "location": [-74.0060, 40.7128],  # New York
                    "media_assets": {
                        "cloudinary_audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                        "cloudinary_image_url": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600"
                    },
                    "analysis_payload": {
                        "risk_score": 52,
                        "detected_injuries": ["Repetitive Distress Barking"],
                        "confidence_percentages": {
                            "Detection: Cat": 91.0,
                            "Vocal Spikes Detected": 12.0
                        }
                    },
                    "operational_status": "Warning"
                },
                {
                    "_id": "seed-3",
                    "incident_id": "seed-3",
                    "timestamp": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
                    "location": [-0.1278, 51.5074],  # London
                    "media_assets": {
                        "cloudinary_audio_url": None,
                        "cloudinary_image_url": "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=600"
                    },
                    "analysis_payload": {
                        "risk_score": 25,
                        "detected_injuries": ["Minor/Under Observation"],
                        "confidence_percentages": {
                            "Detection: Animal": 78.5
                        }
                    },
                    "operational_status": "Stable"
                }
            ]
            for inc in mock_incidents:
                # Convert timestamps to datetime objects for real DB, keep strings for mock
                if not is_mock:
                    inc["timestamp"] = datetime.fromisoformat(inc["timestamp"])
                await db["incidents"].insert_one(inc)
            logger.info("Successfully seeded 3 historical triage items.")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")

    yield
    # Shutdown actions
    logger.info("Stopping AnimAI backend services...")

app = FastAPI(
    title="AnimAI: Guardian Network API",
    description="Asynchronous Triage engine utilizing YOLO11 and Librosa analysis.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(triage_router)

# Mount local uploads static directory for fallback asset streaming
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(os.path.join(static_dir, "uploads"), exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def read_root():
    return {
        "status": "Online",
        "service": "AnimAI: Guardian Network API",
        "database": "Mock (In-Memory)" if is_mock else "Connected (MongoDB Atlas)",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
