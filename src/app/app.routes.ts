import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EventDetailComponent } from './components/event-detail/event-detail.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { SessionRecordComponent } from './components/admin/session-record/session-record.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'apuntarse/:token', component: EventDetailComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'admin/record-session', component: SessionRecordComponent },
  { path: '**', redirectTo: '' }
];

