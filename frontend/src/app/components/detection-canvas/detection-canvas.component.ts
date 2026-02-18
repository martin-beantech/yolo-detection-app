import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Detection } from '../../models/detection.model';

@Component({
  selector: 'app-detection-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detection-canvas.component.html',
  styleUrls: ['./detection-canvas.component.css']
})
export class DetectionCanvasComponent implements OnChanges, AfterViewInit {
  @Input() imageUrl: string | null = null;
  @Input() detections: Detection[] = [];
  @Input() imageWidth: number = 0;
  @Input() imageHeight: number = 0;
  
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageElement', { static: false }) imageRef!: ElementRef<HTMLImageElement>;
  
  private ctx: CanvasRenderingContext2D | null = null;
  private colors: Map<string, string> = new Map();
  private colorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
  ];

  ngAfterViewInit(): void {
    if (this.canvasRef) {
      this.ctx = this.canvasRef.nativeElement.getContext('2d');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['detections'] || changes['imageUrl']) {
      setTimeout(() => this.drawDetections(), 100);
    }
  }

  onImageLoad(): void {
    this.drawDetections();
  }

  private drawDetections(): void {
    if (!this.ctx || !this.canvasRef || !this.imageRef) {
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const image = this.imageRef.nativeElement;
    
    if (!image.complete) {
      return;
    }

    // Set canvas size to match image display size
    const displayWidth = image.offsetWidth;
    const displayHeight = image.offsetHeight;
    
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    // Clear canvas
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scale factors
    const scaleX = displayWidth / this.imageWidth;
    const scaleY = displayHeight / this.imageHeight;

    // Draw each detection
    this.detections.forEach((detection, index) => {
      const color = this.getColorForClass(detection.class_name);
      
      // Scale bounding box coordinates
      const x1 = detection.bbox.x1 * scaleX;
      const y1 = detection.bbox.y1 * scaleY;
      const x2 = detection.bbox.x2 * scaleX;
      const y2 = detection.bbox.y2 * scaleY;
      const width = x2 - x1;
      const height = y2 - y1;

      // Draw bounding box
      this.ctx!.strokeStyle = color;
      this.ctx!.lineWidth = 3;
      this.ctx!.strokeRect(x1, y1, width, height);

      // Draw label background
      const label = `${detection.class_name} ${(detection.confidence * 100).toFixed(1)}%`;
      this.ctx!.font = '14px Arial';
      const textWidth = this.ctx!.measureText(label).width;
      const textHeight = 20;
      
      this.ctx!.fillStyle = color;
      this.ctx!.fillRect(x1, y1 - textHeight, textWidth + 10, textHeight);

      // Draw label text
      this.ctx!.fillStyle = '#ffffff';
      this.ctx!.fillText(label, x1 + 5, y1 - 5);
    });
  }

  private getColorForClass(className: string): string {
    if (!this.colors.has(className)) {
      const colorIndex = this.colors.size % this.colorPalette.length;
      this.colors.set(className, this.colorPalette[colorIndex]);
    }
    return this.colors.get(className)!;
  }
}
