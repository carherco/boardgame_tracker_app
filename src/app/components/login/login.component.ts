import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  phone: string = '';
  name: string = '';
  favoriteGames: string = '';
  step: 'phone' | 'register' = 'phone';
  error: string = '';
  loading: boolean = false;
  returnUrl: string = '/';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Capturamos a dónde quería ir el usuario originalmente
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onIdentify() {
    this.error = '';
    this.loading = true;
    
    this.api.identify(this.phone, this.name || undefined, this.favoriteGames || undefined).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.status === 'new_user') {
          this.step = 'register';
        } else {
          this.auth.setCurrentUser(res);
          this.router.navigateByUrl(this.returnUrl);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Ocurrió un error al identificarte. Inténtalo de nuevo.';
      }
    });
  }
}
