import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

import { GameLocation, Player } from '../../models/interfaces';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  newEvent = { title: '', date: '', time: '', location_id: '' };
  locations: GameLocation[] = [];
  gameSearchQuery: string = '';
  searchResults: any[] = [];
  // Player management
  players: Player[] = [];
  playerSearch: string = '';
  newPlayer = { name: '', phone: '', membershipId: '', favoriteGames: '' };
  bggError: string = '';
  shifts: { name: string, date: string, time: string }[] = [];

  addShiftField() {
    this.shifts.push({ 
      name: '', 
      date: this.newEvent.date || '', 
      time: this.newEvent.time || '16:00' 
    });
  }

  removeShiftField(index: number) {
    this.shifts.splice(index, 1);
  }
  
  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.auth.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    this.api.getLocations().subscribe(data => {
      this.locations = data;
    });
    this.loadPlayers();
  }

  loadPlayers() {
    this.api.getPlayers().subscribe(data => {
      this.players = data;
    });
  }

  onApprovePlayer(playerPhone: string) {
    const admin = this.auth.getCurrentUser();
    if (!admin) return;

    this.api.approvePlayer(admin.phone, playerPhone).subscribe(() => {
      this.loadPlayers();
    });
  }


  onCreateEvent() {
    this.api.createEvent({
        ...this.newEvent,
        shifts: this.shifts,
        admin_phone: this.auth.getCurrentUser()?.phone
    }).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
  // Create a new player from the admin form
  onCreatePlayer(): void {
    if (!this.newPlayer.phone || !this.newPlayer.name) {
      // Optionally add user feedback
      return;
    }
    this.api.identify(
      this.newPlayer.phone,
      this.newPlayer.name,
      this.newPlayer.favoriteGames,
      this.newPlayer.membershipId
    ).subscribe(res => {
      // If API returns a Player object, add it to the local list
      if ((res as any).id) {
        this.players = [...this.players, res as Player];
      }
      // Reset the form fields
      this.newPlayer = { name: '', phone: '', membershipId: '', favoriteGames: '' };
    });
  }
  get filteredPlayers(): Player[] {
    if (!this.playerSearch) return [];
    const term = this.playerSearch.toLowerCase();
    return this.players.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.membershipId.toLowerCase().includes(term)
    );
  }
  onSearchGames() {
    if (!this.gameSearchQuery) return;
    this.bggError = '';
    this.searchResults = [];
    this.api.searchBgg(this.gameSearchQuery).subscribe({
      next: (data) => {
        this.searchResults = data;
      },
      error: (err) => {
        console.error('BGG search error:', err);
        if (err.status === 401 || err.status === 403) {
          this.bggError = err.error?.message || 'BoardGameGeek requiere autenticación mediante Token de API.';
        } else {
          this.bggError = 'Error al buscar en BoardGameGeek. Por favor, comprueba tu conexión.';
        }
      }
    });
  }

  onAddGame(gameData: any) {
    this.bggError = '';
    this.api.addGame(gameData).subscribe({
      next: () => {
        alert('Juego añadido a la biblioteca local');
        this.searchResults = [];
        this.gameSearchQuery = '';
      },
      error: (err) => {
        alert('Error al añadir el juego: ' + (err.error?.message || err.message));
      }
    });
  }
}
