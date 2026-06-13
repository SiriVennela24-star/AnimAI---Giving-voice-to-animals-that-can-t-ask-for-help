import os
import uuid
import logging
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("AnimAI.uploader")

# Configure Cloudinary if credentials exist
CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
API_KEY = os.getenv("CLOUDINARY_API_KEY")
API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
CLOUDINARY_URL = os.getenv("CLOUDINARY_URL")

is_cloudinary_configured = False
if CLOUD_NAME and API_KEY and API_SECRET:
    try:
        cloudinary.config(
            cloud_name=CLOUD_NAME,
            api_key=API_KEY,
            api_secret=API_SECRET,
            secure=True
        )
        is_cloudinary_configured = True
        logger.info("Cloudinary configured successfully via keys.")
    except Exception as e:
        logger.error(f"Failed to configure Cloudinary: {e}")
elif CLOUDINARY_URL:
    try:
        cloudinary.config()
        is_cloudinary_configured = True
        logger.info("Cloudinary configured successfully via CLOUDINARY_URL.")
    except Exception as e:
        logger.error(f"Failed to configure Cloudinary via URL: {e}")

# Ensure local fallback upload directory exists
LOCAL_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "uploads")
os.makedirs(LOCAL_UPLOAD_DIR, exist_ok=True)

async def upload_asset_stream(file_bytes: bytes, original_filename: str) -> str:
    """
    Uploads a file to Cloudinary. 
    If Cloudinary is not configured, saves the file locally to static/uploads/ 
    and returns a local URL relative to the server host.
    """
    ext = os.path.splitext(original_filename)[1]
    unique_filename = f"{uuid.uuid4()}{ext}"

    if is_cloudinary_configured:
        try:
            # We can upload the bytes directly to Cloudinary using a BytesIO-like object or a temp file
            # Uploading bytes using upload requires passing the byte stream
            result = cloudinary.uploader.upload(
                file_bytes,
                public_id=f"animai_{uuid.uuid4().hex[:10]}",
                resource_type="auto"
            )
            logger.info("Uploaded asset to Cloudinary.")
            return result.get("secure_url")
        except Exception as e:
            logger.error(f"Cloudinary upload failed: {e}. Falling back to local storage.")
            # Fall back to local file creation

    # Local file fallback
    local_path = os.path.join(LOCAL_UPLOAD_DIR, unique_filename)
    try:
        with open(local_path, "wb") as f:
            f.write(file_bytes)
        logger.info(f"Saved asset locally to {local_path}.")
        # We will return the URL. The route caller or main.py will need to serve this directory
        # We return a placeholder URL format, which we resolve dynamically or return relative path.
        # Let's return "/static/uploads/<filename>". The frontend can resolve this using the server domain.
        return f"/static/uploads/{unique_filename}"
    except Exception as e:
        logger.error(f"Failed to save file locally: {e}")
        return f"/static/uploads/placeholder{ext}"
