import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GalleryPhoto {
  photoUrl: string;
  notes?: string;
}

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-gallery.component.html',
  styleUrls: ['./photo-gallery.component.css']
})
export class PhotoGalleryComponent {
  @Input() photos: GalleryPhoto[] = [];
  selectedPhotoIndex: number | null = null;
  private touchStartX: number = 0;
  private touchEndX: number = 0;

  openLightbox(index: number) {
    this.selectedPhotoIndex = index;
    document.body.style.overflow = 'hidden'; 
  }

  closeLightbox() {
    this.selectedPhotoIndex = null;
    document.body.style.overflow = 'auto';
  }

  nextPhoto() {
    if (this.selectedPhotoIndex !== null && this.selectedPhotoIndex < this.photos.length - 1) {
      this.selectedPhotoIndex++;
    }
  }

  prevPhoto() {
    if (this.selectedPhotoIndex !== null && this.selectedPhotoIndex > 0) {
      this.selectedPhotoIndex--;
    }
  }

  // GESTOS TÁCTILES
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe() {
    const swipeThreshold = 50; // pixels mínimos para detectar el swipe
    if (this.touchEndX < this.touchStartX - swipeThreshold) {
      this.nextPhoto(); // Deslizamiento a la izquierda -> siguiente
    }
    if (this.touchEndX > this.touchStartX + swipeThreshold) {
      this.prevPhoto(); // Deslizamiento a la derecha -> anterior
    }
  }

  @HostListener('window:keydown', ['$event'])

  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.selectedPhotoIndex === null) return;
    if (event.key === 'ArrowRight') this.nextPhoto();
    if (event.key === 'ArrowLeft') this.prevPhoto();
    if (event.key === 'Escape') this.closeLightbox();
  }
}
