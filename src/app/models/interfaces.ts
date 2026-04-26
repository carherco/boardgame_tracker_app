// app/src/app/models/interfaces.ts

export interface Location {
  id: number;
  name: string;
  address: string;
}

export interface Player {
  id: number;
  name: string;
  phone: string;
  isAdmin: boolean;
  favoriteGames?: string;
}


export interface Game {
  id: number;
  name: string;
  bggId?: number;
  bggUrl?: string;
  imageUrl?: string;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  shareToken: string;
  status: 'open' | 'closed';
  attendees: Player[];
  location?: Location;
}


export interface PlaySession {
  id: number;
  game: Game;
  players: Player[];
}
