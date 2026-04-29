import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  readonly VAPID_PUBLIC_KEY = environment.vapidPublicKey;

  constructor(
    private swPush: SwPush,
    private http: HttpClient,
    private auth: AuthService
  ) {}

  subscribeToNotifications() {
    if (!this.swPush.isEnabled) {
      console.log('Notifications are not enabled for this browser/environment');
      return;
    }

    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(sub => {
      const user = this.auth.getCurrentUser();
      const payload = {
        ...sub.toJSON(),
        phone: user ? user.phone : null
      };

      this.http.post(`${environment.apiUrl}/notifications/subscribe`, payload).subscribe({
        next: () => console.log('Successfully subscribed to notifications'),
        error: (err) => console.error('Could not subscribe to notifications', err)
      });
    })
    .catch(err => console.error('Could not request subscription', err));
  }
}
