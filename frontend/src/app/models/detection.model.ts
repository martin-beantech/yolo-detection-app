export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  class_name: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface DetectionResponse {
  detections: Detection[];
  image_width: number;
  image_height: number;
  total_detections: number;
  inference_time_ms: number;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  api_version: string;
}

export interface ModelInfoResponse {
  model_name: string;
  class_names: string[];
  num_classes: number;
}
