import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {

  private authService = inject(AuthService);
  private router = inject(Router);

  async login() {
    const result = await this.authService.loginWithGoogle();
    if (result) {
      this.router.navigate(['/']);
    }
  }
}
