import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player, Game, Event, Location } from '../models/interfaces';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  identify(phone: string, name?: string, favoriteGames?: string): Observable<Player | { status: string }> {
    return this.http.post<Player | { status: string }>(`${this.apiUrl}/identify`, { phone, name, favoriteGames });
  }


  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events`);
  }

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/locations`);
  }

  getGlobalStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/global`);
  }

  getMyStats(phone: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/me?phone=${phone}`);
  }



  getActiveEvent(): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/active`);
  }

  getEventByToken(token: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${token}`);
  }

  signupToEvent(token: string, phone: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/${token}/signup`, { phone });
  }

  searchBgg(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/games/search?q=${query}`);
  }

  addGame(game: Partial<Game>): Observable<Game> {
    return this.http.post<Game>(`${this.apiUrl}/games/add`, game);
  }

  createEvent(event: any): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/events`, event);
  }

  recordSession(data: { eventId: number, gameId: number, playerIds: number[], notes?: string, photos?: File[] }): Observable<any> {
    const formData = new FormData();
    formData.append('eventId', data.eventId.toString());
    formData.append('gameId', data.gameId.toString());
    formData.append('playerIds', JSON.stringify(data.playerIds));
    if (data.notes) formData.append('notes', data.notes);
    if (data.photos) {
      data.photos.forEach(photo => formData.append('photos[]', photo));
    }
    return this.http.post(`${this.apiUrl}/games/session`, formData);
  }
}

