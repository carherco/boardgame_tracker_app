// app/src/app/models/interfaces.ts

export interface GameLocation {
  id: number;
  name: string;
  address: string;
}

export interface Player {
  id: number;
  membershipId: string;
  name: string;
  phone: string;
  isAdmin: boolean;
  isApproved: boolean;
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

export interface EventShift {
  id: number;
  name: string;
  shiftDate: string;
  startTime: string;
  endTime?: string;
}

export interface EventSignup {
  id: number;
  player: Player;
  checkedIn: boolean;
  checkedInAt?: string;
  signedUpAt: string;
  shifts?: EventShift[];
}

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  shareToken: string;
  status: 'open' | 'closed';
  signups: EventSignup[];
  shifts?: EventShift[];
  sessions: PlaySession[];
  location?: GameLocation;
}


export interface PlaySession {
  id: number;
  game: Game;
  shift?: EventShift;
  players: Player[];
  notes?: string;
}
