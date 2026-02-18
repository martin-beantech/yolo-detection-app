import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Detection } from '../../models/detection.model';

@Component({
  selector: 'app-detection-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detection-results.component.html',
  styleUrls: ['./detection-results.component.css']
})
export class DetectionResultsComponent implements OnChanges {
  @Input() detections: Detection[] = [];
  @Input() inferenceTime: number = 0;
  
  sortedDetections: Detection[] = [];
  uniqueClasses: Set<string> = new Set();

  ngOnChanges(): void {
    this.sortDetections();
    this.updateUniqueClasses();
  }

  sortDetections(): void {
    this.sortedDetections = [...this.detections].sort((a, b) => b.confidence - a.confidence);
  }

  updateUniqueClasses(): void {
    this.uniqueClasses = new Set(this.detections.map(d => d.class_name));
  }

  getConfidenceClass(confidence: number): string {
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.4) return 'medium';
    return 'low';
  }

  formatBBox(detection: Detection): string {
    const { x1, y1, x2, y2 } = detection.bbox;
    return `(${Math.round(x1)}, ${Math.round(y1)}) - (${Math.round(x2)}, ${Math.round(y2)})`;
  }
}
