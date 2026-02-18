"""
FastAPI backend for YOLO object detection inference.
"""
import base64
import io
import logging
import os
import time
from typing import List, Optional

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel
from ultralytics import YOLO

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
YOLO_MODEL = os.getenv("YOLO_MODEL", "yolov8n.pt")
DEFAULT_CONFIDENCE = float(os.getenv("CONFIDENCE_THRESHOLD", "0.25"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:4200").split(",")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB
API_VERSION = os.getenv("API_VERSION", "1.0.0")

# Initialize FastAPI app
app = FastAPI(
    title="YOLO Object Detection API",
    description="FastAPI backend for YOLO object detection inference",
    version=API_VERSION,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model
logger.info(f"Loading YOLO model: {YOLO_MODEL}")
model = YOLO(YOLO_MODEL)
logger.info("YOLO model loaded successfully")


# Pydantic models
class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class Detection(BaseModel):
    class_name: str
    confidence: float
    bbox: BoundingBox


class DetectionResponse(BaseModel):
    detections: List[Detection]
    image_width: int
    image_height: int
    total_detections: int
    inference_time_ms: float


class Base64ImageRequest(BaseModel):
    image: str
    confidence: Optional[float] = DEFAULT_CONFIDENCE


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    api_version: str


class ModelInfoResponse(BaseModel):
    model_name: str
    class_names: List[str]
    num_classes: int


def validate_image_file(content_type: str, file_size: int) -> None:
    """Validate uploaded image file."""
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}",
        )
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB",
        )


def process_image_detection(image: Image.Image, confidence: float) -> DetectionResponse:
    """Process image detection with YOLO model."""
    # Run inference
    start_time = time.time()
    results = model(image, conf=confidence, verbose=False)
    inference_time = (time.time() - start_time) * 1000  # Convert to milliseconds

    # Get image dimensions
    image_width, image_height = image.size

    # Parse results
    detections = []
    for result in results:
        boxes = result.boxes
        for box in boxes:
            # Get box coordinates (xyxy format)
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            
            # Get confidence and class
            confidence_score = float(box.conf[0])
            class_id = int(box.cls[0])
            class_name = model.names[class_id]

            detection = Detection(
                class_name=class_name,
                confidence=confidence_score,
                bbox=BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2),
            )
            detections.append(detection)

    logger.info(
        f"Detected {len(detections)} objects in {inference_time:.2f}ms "
        f"(confidence >= {confidence})"
    )

    return DetectionResponse(
        detections=detections,
        image_width=image_width,
        image_height=image_height,
        total_detections=len(detections),
        inference_time_ms=round(inference_time, 2),
    )


@app.get("/", tags=["Root"])
async def read_root():
    """Root endpoint."""
    return {
        "message": "YOLO Object Detection API",
        "version": API_VERSION,
        "endpoints": {
            "POST /detect": "Detect objects from uploaded image file",
            "POST /detect-base64": "Detect objects from base64 encoded image",
            "GET /health": "Health check",
            "GET /model-info": "Get model information",
        },
    }


@app.post("/detect", response_model=DetectionResponse, tags=["Detection"])
async def detect_objects(
    file: UploadFile = File(...),
    confidence: float = Query(DEFAULT_CONFIDENCE, ge=0.0, le=1.0),
):
    """
    Detect objects in an uploaded image file.
    
    Args:
        file: Image file (jpg, jpeg, png, webp)
        confidence: Confidence threshold (0.0-1.0)
    
    Returns:
        DetectionResponse with detected objects and metadata
    """
    try:
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        # Validate file
        validate_image_file(file.content_type, file_size)
        
        # Open image
        image = Image.open(io.BytesIO(content))
        
        # Process detection
        response = process_image_detection(image, confidence)
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")


@app.post("/detect-base64", response_model=DetectionResponse, tags=["Detection"])
async def detect_objects_base64(request: Base64ImageRequest):
    """
    Detect objects in a base64-encoded image.
    
    Args:
        request: Base64ImageRequest with image data and confidence threshold
    
    Returns:
        DetectionResponse with detected objects and metadata
    """
    try:
        # Decode base64 image
        # Remove data URL prefix if present
        image_data = request.image
        if "," in image_data:
            image_data = image_data.split(",")[1]
        
        image_bytes = base64.b64decode(image_data)
        
        # Validate file size
        if len(image_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB",
            )
        
        # Open image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Process detection
        response = process_image_detection(image, request.confidence)
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing base64 image: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error processing base64 image: {str(e)}"
        )


@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        HealthResponse with API status and model information
    """
    return HealthResponse(
        status="healthy",
        model_loaded=model is not None,
        api_version=API_VERSION,
    )


@app.get("/model-info", response_model=ModelInfoResponse, tags=["System"])
async def get_model_info():
    """
    Get information about the loaded YOLO model.
    
    Returns:
        ModelInfoResponse with model details and class names
    """
    return ModelInfoResponse(
        model_name=YOLO_MODEL,
        class_names=list(model.names.values()),
        num_classes=len(model.names),
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
