# 🔍 YOLO Object Detection Web Application

A complete full-stack web application for real-time object detection using YOLOv8, built with Angular frontend and FastAPI backend.

![YOLO Detection App](https://img.shields.io/badge/YOLO-v8-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green) ![Angular](https://img.shields.io/badge/Angular-19.2.18-red)

## 🌟 Features

### Frontend (Angular)
- **Drag & Drop Image Upload** - Intuitive file upload interface with visual feedback
- **Real-time Detection Visualization** - Canvas overlay with color-coded bounding boxes
- **Interactive Results Table** - Sortable table with confidence scores and class labels
- **Confidence Threshold Control** - Adjustable slider to filter detections
- **Responsive Design** - Modern dark theme that works on desktop and tablet
- **Live API Status** - Real-time connection indicator

### Backend (FastAPI)
- **Multiple Detection Endpoints** - Support for file upload and base64 encoding
- **YOLOv8 Integration** - Fast and accurate object detection using Ultralytics
- **Configurable Confidence** - Adjustable threshold for detection filtering
- **Health Monitoring** - API health check and model information endpoints
- **Comprehensive Error Handling** - Validation for file types, sizes, and formats
- **CORS Support** - Configured for seamless frontend-backend communication

## 🎨 UI Preview

The application features a clean, modern dark theme with:
- Card-based layout for intuitive navigation
- Color-coded confidence badges (🟢 High ≥70%, 🟡 Medium ≥40%, 🔴 Low <40%)
- Real-time loading indicators
- Responsive bounding box visualization
- Summary statistics (total detections, unique classes, inference time)

## 📋 Prerequisites

### For Docker Setup (Recommended)
- Docker 20.10+
- Docker Compose 2.0+

### For Manual Setup
- Python 3.11+
- Node.js 18+
- npm 9+

## 🚀 Quick Start with Docker Compose

The easiest way to run the application is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd yolo-detection-app

# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:4200
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

To stop the services:
```bash
docker-compose down
```

## 🛠️ Manual Setup

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment (optional):**
   ```bash
   cp .env.example .env
   # Edit .env with your preferred settings
   ```

5. **Run the backend server:**
   ```bash
   python main.py
   # Or with uvicorn:
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm start
   # Or:
   ng serve
   ```

The frontend will be available at `http://localhost:4200`

## 📚 API Documentation

### Endpoints

#### 1. POST /detect
Upload an image file for object detection.

**Request:**
```bash
curl -X POST "http://localhost:8000/detect?confidence=0.25" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/image.jpg"
```

**Response:**
```json
{
  "detections": [
    {
      "class_name": "person",
      "confidence": 0.92,
      "bbox": {
        "x1": 120.5,
        "y1": 80.3,
        "x2": 340.7,
        "y2": 480.2
      }
    }
  ],
  "image_width": 640,
  "image_height": 480,
  "total_detections": 1,
  "inference_time_ms": 45.2
}
```

#### 2. POST /detect-base64
Send a base64-encoded image for detection.

**Request:**
```bash
curl -X POST "http://localhost:8000/detect-base64" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "confidence": 0.25
  }'
```

#### 3. GET /health
Check API health status.

**Request:**
```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "api_version": "1.0.0"
}
```

#### 4. GET /model-info
Get information about the loaded YOLO model.

**Request:**
```bash
curl http://localhost:8000/model-info
```

**Response:**
```json
{
  "model_name": "yolov8n.pt",
  "class_names": ["person", "bicycle", "car", ...],
  "num_classes": 80
}
```

### Interactive API Documentation
FastAPI provides automatic interactive documentation:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## ⚙️ Configuration Options

### Backend Environment Variables

Create a `.env` file in the `backend/` directory based on `.env.example`:

| Variable | Default | Description |
|----------|---------|-------------|
| `YOLO_MODEL` | `yolov8n.pt` | YOLO model variant (n/s/m/l/x) |
| `CONFIDENCE_THRESHOLD` | `0.25` | Default confidence threshold |
| `CORS_ORIGINS` | `http://localhost:4200` | Allowed CORS origins (comma-separated) |
| `MAX_FILE_SIZE` | `10485760` | Max upload size in bytes (10MB) |
| `API_VERSION` | `1.0.0` | API version string |

### Available YOLO Models

You can use different YOLOv8 model variants by changing the `YOLO_MODEL` environment variable:

- **yolov8n.pt** - Nano (fastest, least accurate)
- **yolov8s.pt** - Small
- **yolov8m.pt** - Medium
- **yolov8l.pt** - Large
- **yolov8x.pt** - Extra Large (slowest, most accurate)

## 🧪 Testing the Application

### Using the Web Interface

1. Open http://localhost:4200 in your browser
2. Drag and drop an image or click "Browse Files"
3. Adjust the confidence threshold slider if needed (default: 0.25)
4. Click "🎯 Detect Objects" to run inference
5. View results with bounding boxes and detailed table

### Using curl

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test detection with an image
curl -X POST "http://localhost:8000/detect?confidence=0.3" \
  -F "file=@sample_image.jpg" | jq

# Get model information
curl http://localhost:8000/model-info | jq
```

## 🐳 Docker Commands

### Build only
```bash
docker-compose build
```

### Run in detached mode
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f
docker-compose logs -f backend  # Backend only
docker-compose logs -f frontend  # Frontend only
```

### Restart services
```bash
docker-compose restart
```

### Stop and remove containers
```bash
docker-compose down
```

### Remove volumes (including cached YOLO models)
```bash
docker-compose down -v
```

## 🔧 Troubleshooting

### Backend Issues

**Problem:** Model download fails
```
Solution: Ensure you have a stable internet connection. The model 
will be downloaded automatically on first run and cached.
```

**Problem:** CORS errors
```
Solution: Check that CORS_ORIGINS includes your frontend URL.
Update the environment variable or .env file.
```

**Problem:** File upload fails
```
Solution: Verify file size is under 10MB and format is jpg/jpeg/png/webp.
Check MAX_FILE_SIZE environment variable.
```

### Frontend Issues

**Problem:** API connection fails
```
Solution: Ensure backend is running on port 8000.
Check the API URL in DetectionService (src/app/services/detection.service.ts).
```

**Problem:** Canvas not showing bounding boxes
```
Solution: Wait for the image to fully load. Check browser console for errors.
Ensure detections array is not empty.
```

### Docker Issues

**Problem:** Port already in use
```
Solution: Stop other services using ports 4200 or 8000, or modify 
docker-compose.yml to use different ports.
```

**Problem:** Build fails
```
Solution: Ensure Docker and Docker Compose are up to date.
Try: docker-compose down && docker-compose build --no-cache
```

## 📦 Project Structure

```
yolo-detection-app/
├── backend/
│   ├── main.py                   # FastAPI application
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                # Backend Docker configuration
│   └── .env.example              # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── image-upload/
│   │   │   │   ├── detection-canvas/
│   │   │   │   └── detection-results/
│   │   │   ├── services/
│   │   │   │   └── detection.service.ts
│   │   │   ├── models/
│   │   │   │   └── detection.model.ts
│   │   │   └── app.component.*
│   │   ├── styles.css
│   │   └── index.html
│   ├── Dockerfile                # Frontend Docker configuration
│   ├── nginx.conf                # Nginx configuration
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml            # Multi-container orchestration
└── README.md                     # This file
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **YOLOv8** by [Ultralytics](https://github.com/ultralytics/ultralytics)
- **FastAPI** by [Sebastián Ramírez](https://github.com/tiangolo/fastapi)
- **Angular** by [Google](https://angular.io/)

## 📞 Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

---

**Built with ❤️ using YOLOv8, FastAPI, and Angular**
