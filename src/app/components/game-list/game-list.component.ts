import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Game } from '../../models/interfaces';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-list.component.html',
  styleUrl: './game-list.component.css'
})
export class GameListComponent implements OnInit {
  games: Game[] = [];
  filteredGames: Game[] = [];
  
  searchTerm: string = '';
  playerCount: number | null = null;
  maxTime: number | null = null;
  maxComplexity: number | null = null;

  loading: boolean = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getGames().subscribe({
      next: (data) => {
        this.games = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilters() {
    this.filteredGames = this.games.filter(game => {
      // Name filter
      if (this.searchTerm && !game.name.toLowerCase().includes(this.searchTerm.toLowerCase())) {
        return false;
      }

      // Players filter (check if it fits in min-max)
      if (this.playerCount) {
        if (game.minPlayers && this.playerCount < game.minPlayers) return false;
        if (game.maxPlayers && this.playerCount > game.maxPlayers) return false;
      }

      // Time filter
      if (this.maxTime && game.playingTime && game.playingTime > this.maxTime) {
        return false;
      }

      // Complexity filter
      if (this.maxComplexity && game.complexity && game.complexity > this.maxComplexity) {
        return false;
      }

      return true;
    });

    // Sort by name
    this.filteredGames.sort((a, b) => a.name.localeCompare(b.name));
  }

  getComplexityColor(complexity: number): string {
    if (complexity < 2) return '#22c55e'; // Verde
    if (complexity < 3) return '#eab308'; // Amarillo
    if (complexity < 4) return '#f97316'; // Naranja
    return '#ef4444'; // Rojo
  }

  resetFilters() {
    this.searchTerm = '';
    this.playerCount = null;
    this.maxTime = null;
    this.maxComplexity = null;
    this.applyFilters();
  }
}
