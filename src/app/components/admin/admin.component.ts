import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

import { GameLocation } from '../../models/interfaces';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  newEvent = { title: '', date: '', time: '', location_id: '' };
  locations: GameLocation[] = [];
  gameSearchQuery: string = '';
  searchResults: any[] = [];
  
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
  }


  onCreateEvent() {
    this.api.createEvent({
        ...this.newEvent,
        admin_phone: this.auth.getCurrentUser()?.phone
    }).subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  onSearchGames() {
    if (!this.gameSearchQuery) return;
    this.api.searchBgg(this.gameSearchQuery).subscribe(data => {
      this.searchResults = data;
    });
  }

  onAddGame(gameData: any) {
    this.api.addGame(gameData).subscribe(() => {
        alert('Juego añadido a la biblioteca local');
        this.searchResults = [];
        this.gameSearchQuery = '';
    });
  }
}
