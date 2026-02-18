import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DetectionResponse, HealthResponse, ModelInfoResponse } from '../models/detection.model';

@Injectable({
  providedIn: 'root'
})
export class DetectionService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  /**
   * Detect objects in an uploaded image file
   * @param file Image file to analyze
   * @param confidence Confidence threshold (0-1)
   * @returns Observable of DetectionResponse
   */
  detectFromFile(file: File, confidence: number = 0.25): Observable<DetectionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const params = new HttpParams().set('confidence', confidence.toString());
    
    return this.http.post<DetectionResponse>(
      `${this.apiUrl}/detect`,
      formData,
      { params }
    );
  }

  /**
   * Get API health status
   * @returns Observable of HealthResponse
   */
  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.apiUrl}/health`);
  }

  /**
   * Get model information
   * @returns Observable of ModelInfoResponse
   */
  getModelInfo(): Observable<ModelInfoResponse> {
    return this.http.get<ModelInfoResponse>(`${this.apiUrl}/model-info`);
  }
}
