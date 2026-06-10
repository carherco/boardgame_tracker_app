import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Player } from '../../models/interfaces';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './player-detail.component.html',
  styleUrl: './player-detail.component.css'
})
export class PlayerDetailComponent implements OnInit {
  user: Player | null = null;
  profileData: any = null;
  loading: boolean = true;
  error: string = '';

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/perfil' } });
      return;
    }
    this.loadProfileData();
  }

  loadProfileData() {
    if (!this.user) return;
    this.loading = true;
    this.error = '';

    this.api.getMyStats(this.user.phone).subscribe({
      next: (data) => {
        this.profileData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching player profile data', err);
        this.error = 'No se pudieron cargar tus estadísticas. Inténtalo de nuevo más tarde.';
        this.loading = false;
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  formatTime(minutes: number): string {
    if (!minutes || minutes <= 0) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
    }
    return `${mins} min`;
  }
}
