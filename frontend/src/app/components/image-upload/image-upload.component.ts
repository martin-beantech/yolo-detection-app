import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent {
  @Output() imageSelected = new EventEmitter<File>();
  
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isDragging = false;
  error: string | null = null;
  
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.error = null;
    
    // Validate file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.error = 'Invalid file type. Please upload a JPG, PNG, or WebP image.';
      return;
    }
    
    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      this.error = `File too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB.`;
      return;
    }
    
    this.selectedFile = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    
    // Emit file to parent
    this.imageSelected.emit(file);
  }

  clearImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.error = null;
  }
}
