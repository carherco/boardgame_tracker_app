import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { GameLocation, Player, PlayerRankingEntry, PlayersStats } from '../../../models/interfaces';

type RankingKey = keyof PlayersStats['rankings'];

@Component({
  selector: 'app-player-stats',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './player-stats.component.html',
  styleUrl: './player-stats.component.css'
})
export class PlayerStatsComponent implements OnInit {
  stats: PlayersStats | null = null;
  locations: GameLocation[] = [];
  selectedLocationId: number | null = null;
  loading: boolean = true;
  error: string = '';
  private adminPhone: string | null = null;

  rankingTabs: { key: RankingKey, label: string, units: [string, string] }[] = [
    { key: 'events', label: 'Eventos', units: ['evento', 'eventos'] },
    { key: 'sessions', label: 'Partidas', units: ['partida', 'partidas'] },
    { key: 'differentGames', label: 'Juegos distintos', units: ['juego', 'juegos'] },
    { key: 'playingTime', label: 'Tiempo en mesa', units: ['', ''] }
  ];
  activeTab: RankingKey = 'events';

  players: Player[] = [];
  playerSearch: string = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const admin = this.auth.getCurrentUser();
    if (!admin || !this.auth.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }

    this.adminPhone = admin.phone;
    this.loadStats();
    this.api.getLocations().subscribe({
      next: (locations) => this.locations = locations,
      error: () => this.locations = []
    });

    this.api.getPlayers().subscribe(data => this.players = data);
  }

  onLocationChange(locationId: string): void {
    this.selectedLocationId = locationId ? Number(locationId) : null;
    this.loadStats();
  }

  private loadStats(): void {
    if (!this.adminPhone) return;
    this.loading = true;
    this.error = '';
    this.api.getPlayersStats(this.adminPhone, this.selectedLocationId).subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las estadísticas.';
        this.loading = false;
      }
    });
  }

  get activeRanking(): PlayerRankingEntry[] {
    return this.stats?.rankings[this.activeTab] || [];
  }

  get filteredPlayers(): Player[] {
    const q = this.normalize(this.playerSearch.trim());
    if (!q) return [];
    return this.players
      .filter(p => this.normalize(p.name).includes(q) || p.membershipId?.includes(q))
      .slice(0, 8);
  }

  formatValue(value: number): string {
    if (this.activeTab !== 'playingTime') {
      const units = this.rankingTabs.find(t => t.key === this.activeTab)!.units;
      return `${value} ${value === 1 ? units[0] : units[1]}`;
    }
    const hours = Math.floor(value / 60);
    const mins = value % 60;
    return hours > 0 ? `${hours}h ${mins > 0 ? mins + 'm' : ''}` : `${mins} min`;
  }

  private normalize(text: string): string {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
