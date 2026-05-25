import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Player, Game } from '../../models/interfaces';
import { PhotoGalleryComponent, GalleryPhoto } from '../shared/photo-gallery/photo-gallery.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PhotoGalleryComponent],
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
  checkingIn: string | null = null;
  showQR: boolean = false;
  qrUrl: string = '';

  // Admin add-player
  allPlayers: Player[] = [];
  playerSearch: string = '';
  filteredPlayers: Player[] = [];
  showSuggestions: boolean = false;
  addingPlayer: boolean = false;
  addPlayerSuccess: string = '';
  addPlayerError: string = '';

  // Record session
  allGames: Game[] = [];
  showSessionPanel: boolean = false;
  gameSearch: string = '';
  filteredGames: Game[] = [];
  showGameSuggestions: boolean = false;
  selectedGame: Game | null = null;
  selectedPlayerIds: Set<number> = new Set();
  sessionNotes: string = '';
  savingSession: boolean = false;
  sessionSuccess: string = '';
  sessionError: string = '';

  get sortedSignups(): any[] {
    return [...(this.event?.signups || [])].sort((a, b) =>
      a.player.name.localeCompare(b.player.name, 'es', { sensitivity: 'base' })
    );
  }

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    this.user = this.auth.getCurrentUser();
    const baseUrl = document.querySelector('base')?.href || window.location.origin + '/';
    this.qrUrl = `${baseUrl}apuntarse/${this.token}`;
    this.loadEvent();
    if (this.auth.isAdmin()) {
      this.loadAllPlayers();
      this.loadAllGames();
    }
  }

  loadAllPlayers() {
    this.api.getPlayers().subscribe({
      next: (players) => this.allPlayers = players,
      error: () => {}
    });
  }

  loadAllGames() {
    this.api.getGames().subscribe({
      next: (games) => this.allGames = games,
      error: () => {}
    });
  }

  // ── Add player autocomplete ─────────────────────────────────────

  onPlayerSearchInput() {
    const q = this.playerSearch.trim().toLowerCase();
    if (!q) {
      this.filteredPlayers = [];
      this.showSuggestions = false;
      return;
    }
    const signedUpIds = new Set(
      (this.event?.signups || []).map((s: any) => s.player?.id)
    );
    this.filteredPlayers = this.allPlayers
      .filter(p => !signedUpIds.has(p.id) && p.name.toLowerCase().includes(q))
      .slice(0, 8);
    this.showSuggestions = this.filteredPlayers.length > 0;
  }

  selectPlayer(player: Player) {
    this.playerSearch = player.name;
    this.showSuggestions = false;
    this.addPlayerError = '';
    this.addPlayerSuccess = '';
    this.onAdminAddPlayer(player);
  }

  onAdminAddPlayer(player: Player) {
    if (!this.user || !this.auth.isAdmin()) return;
    this.addingPlayer = true;
    this.addPlayerError = '';
    this.addPlayerSuccess = '';
    this.api.adminAddPlayerToEvent(this.token, this.user.phone, player.id).subscribe({
      next: () => {
        this.addingPlayer = false;
        this.addPlayerSuccess = `${player.name} añadido al evento ✅`;
        this.playerSearch = '';
        this.filteredPlayers = [];
        this.loadEvent();
        setTimeout(() => this.addPlayerSuccess = '', 3000);
      },
      error: (err) => {
        this.addingPlayer = false;
        this.addPlayerError = err.error?.error || 'Error al añadir el jugador';
      }
    });
  }

  hideSuggestionsDelayed() {
    setTimeout(() => this.showSuggestions = false, 180);
  }

  // ── Record session ──────────────────────────────────────────────

  openSessionPanel() {
    this.showSessionPanel = true;
    this.selectedGame = null;
    this.gameSearch = '';
    this.filteredGames = [];
    this.showGameSuggestions = false;
    this.selectedPlayerIds = new Set();
    this.sessionNotes = '';
    this.sessionSuccess = '';
    this.sessionError = '';
    // Pre-select all checked-in attendees
    (this.event?.signups || []).forEach((s: any) => {
      if (s.checkedIn) this.selectedPlayerIds.add(s.player.id);
    });
  }

  closeSessionPanel() {
    this.showSessionPanel = false;
  }

  onGameSearchInput() {
    const q = this.gameSearch.trim().toLowerCase();
    if (!q) {
      this.filteredGames = [];
      this.showGameSuggestions = false;
      return;
    }
    this.filteredGames = this.allGames
      .filter(g => g.name.toLowerCase().includes(q))
      .slice(0, 8);
    this.showGameSuggestions = this.filteredGames.length > 0;
  }

  selectGame(game: Game) {
    this.selectedGame = game;
    this.gameSearch = game.name;
    this.showGameSuggestions = false;
  }

  hideGameSuggestionsDelayed() {
    setTimeout(() => this.showGameSuggestions = false, 180);
  }

  toggleSessionPlayer(playerId: number) {
    if (this.selectedPlayerIds.has(playerId)) {
      this.selectedPlayerIds.delete(playerId);
    } else {
      this.selectedPlayerIds.add(playerId);
    }
  }

  isSessionPlayerSelected(playerId: number): boolean {
    return this.selectedPlayerIds.has(playerId);
  }

  submitSession() {
    if (!this.selectedGame || !this.event) return;
    this.savingSession = true;
    this.sessionError = '';
    this.sessionSuccess = '';

    this.api.recordSession({
      eventId: this.event.id,
      gameId: this.selectedGame.id,
      playerIds: Array.from(this.selectedPlayerIds),
      notes: this.sessionNotes || undefined
    }).subscribe({
      next: () => {
        this.savingSession = false;
        this.sessionSuccess = `Partida de "${this.selectedGame!.name}" registrada ✅`;
        this.loadEvent();
        setTimeout(() => {
          this.sessionSuccess = '';
          this.closeSessionPanel();
        }, 2000);
      },
      error: (err) => {
        this.savingSession = false;
        this.sessionError = err.error?.error || 'Error al guardar la partida';
      }
    });
  }

  // ── QR & sharing ────────────────────────────────────────────────

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

  // ── Event loading ───────────────────────────────────────────────

  loadEvent() {
    this.loading = true;
    this.api.getEventByToken(this.token).subscribe({
      next: (data) => {
        this.event = data;
        this.extractPhotos();
        this.checkSignup();
        this.loading = false;

        if (this.user && !this.isSignedUp) {
          this.onSignup();
        }
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

  onApprovePlayer(playerPhone: string) {
    if (!this.user || !this.auth.isAdmin()) return;
    this.api.approvePlayer(this.user.phone, playerPhone).subscribe(() => {
      this.loadEvent();
    });
  }

  onCheckIn(playerPhone: string) {
    if (!this.user || !this.auth.isAdmin()) return;
    this.checkingIn = playerPhone;
    this.api.checkIn(this.token, this.user.phone, playerPhone).subscribe({
      next: () => {
        this.checkingIn = null;
        this.loadEvent();
      },
      error: () => this.checkingIn = null
    });
  }
}
