import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Event, Player, PlaySession } from '../../models/interfaces';
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
  event: any | null = null; // Changed from Event to any to handle nested sessions/photos
  allPhotos: GalleryPhoto[] = [];
  user: Player | null = null;
  isSignedUp: boolean = false;
  loading: boolean = true;


  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    this.user = this.auth.getCurrentUser();
    this.loadEvent();
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
    
    // Si la URL empieza por /uploads, le ponemos el prefijo de la API
    // En producción environment.apiUrl es 'https://carherco.es/boardgametracker/api'
    const baseUrl = this.api.getBaseUrl();
    return `${baseUrl}${url}`;
  }


  checkSignup() {
    if (this.user && this.event) {
      this.isSignedUp = this.event.attendees.some((a: Player) => a.phone === this.user?.phone);
    }
  }

  onSignup() {
    if (!this.user) return;
    this.api.signupToEvent(this.token, this.user.phone).subscribe(() => {
      this.loadEvent();
    });
  }
}
