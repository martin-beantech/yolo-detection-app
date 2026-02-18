import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { DetectionCanvasComponent } from './components/detection-canvas/detection-canvas.component';
import { DetectionResultsComponent } from './components/detection-results/detection-results.component';
import { DetectionService } from './services/detection.service';
import { DetectionResponse } from './models/detection.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ImageUploadComponent,
    DetectionCanvasComponent,
    DetectionResultsComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'YOLO Object Detection';
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  detectionResponse: DetectionResponse | null = null;
  isLoading = false;
  error: string | null = null;
  confidenceThreshold = 0.25;
  apiHealth: string = 'checking...';

  constructor(private detectionService: DetectionService) {
    this.checkApiHealth();
  }

  checkApiHealth(): void {
    this.detectionService.getHealth().subscribe({
      next: (response) => {
        this.apiHealth = response.status === 'healthy' ? 'connected' : 'error';
      },
      error: () => {
        this.apiHealth = 'disconnected';
      }
    });
  }

  onImageSelected(file: File): void {
    this.selectedFile = file;
    this.error = null;
    this.detectionResponse = null;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onDetect(): void {
    if (!this.selectedFile) {
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.detectionResponse = null;

    this.detectionService.detectFromFile(this.selectedFile, this.confidenceThreshold).subscribe({
      next: (response) => {
        this.detectionResponse = response;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.detail || 'Failed to process image. Please try again.';
        this.isLoading = false;
      }
    });
  }

  resetDetection(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.detectionResponse = null;
    this.error = null;
  }
}
