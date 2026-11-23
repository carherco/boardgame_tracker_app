import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Event, Player } from '../../models/interfaces';

import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  events: Event[] = [];
  user: Player | null = null;
  globalStats: any = null;
  personalStats: any = null;
  loading: boolean = true;

  get upcomingEvents(): Event[] {
    const today = this.localDateKey(new Date());
    return this.events
      .filter(event => this.eventDateKey(event.date) >= today)
      .sort((a, b) => this.eventDateKey(a.date).localeCompare(this.eventDateKey(b.date)));
  }

  get pastEvents(): Event[] {
    const today = this.localDateKey(new Date());
    return this.events
      .filter(event => this.eventDateKey(event.date) < today)
      .sort((a, b) => this.eventDateKey(b.date).localeCompare(this.eventDateKey(a.date)));
  }

  private eventDateKey(value: string): string {
    return value.substring(0, 10);
  }

  private localDateKey(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private notifications: NotificationService
  ) {}

  requestNotifications() {
    this.notifications.subscribeToNotifications();
  }


  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    this.loadData();
  }

  loadData() {
    this.loading = true;

    // Cargar eventos
    this.api.getEvents().subscribe(data => {
      this.events = data;
      this.loading = false;
    });

    // Cargar estadísticas
    if (this.user) {
      this.api.getMyStats(this.user.phone).subscribe(stats => {
        this.personalStats = stats;
      });

      if (this.auth.isAdmin()) {
        this.api.getGlobalStats().subscribe(stats => {
          this.globalStats = stats;
        });
      }
    }
  }
}

