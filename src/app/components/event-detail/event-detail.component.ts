import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Player } from '../../models/interfaces';
import { PhotoGalleryComponent, GalleryPhoto } from '../shared/photo-gallery/photo-gallery.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, PhotoGalleryComponent],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css'
})
export class EventDetailComponent implements OnInit {
  token: string = '';
  event: any | null = null;
  allPhotos: GalleryPhoto[] = [];
  user: Player | null = null;
  isSignedUp: boolean = false;
  loading: boolean = true;
  checkingIn: string | null = null; // phone of the player being checked in
  showQR: boolean = false;
  qrUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    this.user = this.auth.getCurrentUser();
    this.qrUrl = `${window.location.origin}/apuntarse/${this.token}`;
    this.loadEvent();
  }

  toggleQR() {
    this.showQR = !this.showQR;
  }

  onShareLink() {
    if (navigator.share) {
      navigator.share({
        title: `Invitación a: ${this.event.title}`,
        text: `¡Apúntate al evento de juegos de mesa!`,
        url: this.qrUrl
      }).catch(console.error);
    } else {
      this.onCopyLink();
    }
  }

  onCopyLink() {
    navigator.clipboard.writeText(this.qrUrl).then(() => {
      alert('¡Enlace copiado al portapapeles!');
    });
  }

  loadEvent() {
    this.loading = true;
    this.api.getEventByToken(this.token).subscribe({
      next: (data) => {
        this.event = data;
        this.extractPhotos();
        this.checkSignup();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  extractPhotos() {
    this.allPhotos = [];
    if (this.event && this.event.sessions) {
      this.event.sessions.forEach((session: any) => {
        if (session.photos) {
          session.photos.forEach((photo: any) => {
            this.allPhotos.push({
              photoUrl: this.formatPhotoUrl(photo.photoUrl),
              notes: session.notes
            });
          });
        }
      });
    }
  }

  formatPhotoUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = this.api.getBaseUrl();
    return `${baseUrl}${url}`;
  }

  checkSignup() {
    if (this.user && this.event?.signups) {
      // The signups array now contains objects with a player property
      this.isSignedUp = this.event.signups.some(
        (s: any) => s.player?.phone === this.user?.phone
      );
    }
  }

  onSignup() {
    if (!this.user) return;
    this.api.signupToEvent(this.token, this.user.phone).subscribe(() => {
      this.loadEvent();
    });
  }

  onCheckIn(playerPhone: string) {
    if (!this.user || !this.auth.isAdmin()) return;
    this.checkingIn = playerPhone;
    this.api.checkIn(this.token, this.user.phone, playerPhone).subscribe({
      next: () => {
        this.checkingIn = null;
        this.loadEvent(); // Reload to get updated state
      },
      error: () => this.checkingIn = null
    });
  }
}
