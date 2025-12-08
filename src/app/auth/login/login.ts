import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {

  email: string = '';
  password: string = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    // Si ya hay sesión activa → redirigir
    this.authService.userData$.subscribe(user => {
      if (user && user['role']) {
        this.redirectByRole(user['role']);
      }
    });
  }

  // -----------------------------------
  // LOGIN CON EMAIL
  // -----------------------------------
  async loginEmail() {
    try {
      const user = await this.authService.loginWithEmail(this.email, this.password);

      if (user && user['role']) {
        this.redirectByRole(user['role']);
      }
    } catch (error) {
      console.error("Error login email:", error);
      alert("Correo o contraseña incorrectos");
    }
  }

  // -----------------------------------
  // LOGIN CON GOOGLE
  // -----------------------------------
  async loginGoogle() {
    try {
      await this.authService.loginWithGoogle();

      // Esperar los datos del usuario
      this.authService.userData$.subscribe(user => {
        if (user && user['role']) {
          this.redirectByRole(user['role']);
        }
      });

    } catch (error) {
      console.error("Error login Google:", error);
    }
  }

  // -----------------------------------
  // REDIRECCIÓN SEGÚN ROL
  // -----------------------------------
  private redirectByRole(role: string) {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;

      case 'programador':
        this.router.navigate(['/programador']);
        break;

      default:
        this.router.navigate(['/']);
        break;
    }
  }
}
