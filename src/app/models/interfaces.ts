// app/src/app/models/interfaces.ts

export interface GameLocation {
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
  minPlayers?: number;
  maxPlayers?: number;
  bestPlayers?: string;
  recommendedPlayers?: string;
  playingTime?: number;
  complexity?: number;
  itemType?: string;
  owners?: Player[];
  locations?: GameLocation[];
}

export interface EventSignup {
  id: number;
  player: Player;
  checkedIn: boolean;
  checkedInAt?: string;
  signedUpAt: string;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  shareToken: string;
  status: 'open' | 'closed';
  signups: EventSignup[];
  location?: GameLocation;
}


export interface PlaySession {
  id: number;
  game: Game;
  players: Player[];
}
