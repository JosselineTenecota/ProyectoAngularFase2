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
  

  constructor() {
    // Ya hay sesión activa → redirigir automáticamente
    this.authService.userData$.subscribe(user => {
      if (user && user.role) {
        this.redirectByRole(user.role);
      }
    });
  }

  async login() {
    try {
      // Realizar login y garantizar que el user se cree o actualice en Firestore
      await this.authService.loginWithGoogle();

      // Esperamos a que AuthService emita los datos completos del usuario (incluido role)
      this.authService.userData$.subscribe(user => {
        if (!user) return;          // Aún no carga
        if (!user.role) return;     // Documento sin rol aún
        
        this.redirectByRole(user.role);
      });

    } catch (error) {
      console.error("Error en login:", error);
    }
  }

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
