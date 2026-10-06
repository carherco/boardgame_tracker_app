import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EventDetailComponent } from './components/event-detail/event-detail.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { SessionRecordComponent } from './components/admin/session-record/session-record.component';
import { GameListComponent } from './components/game-list/game-list.component';
import { PlayerDetailComponent } from './components/player-detail/player-detail.component';
import { PlayerStatsComponent } from './components/admin/player-stats/player-stats.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'juegos', component: GameListComponent },
  { path: 'apuntarse/:token', component: EventDetailComponent },
  { path: 'perfil', component: PlayerDetailComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'admin/record-session', component: SessionRecordComponent },
  { path: 'admin/jugadores', component: PlayerStatsComponent },
  { path: 'admin/jugadores/:id', component: PlayerDetailComponent },
  { path: '**', redirectTo: '' }
];

