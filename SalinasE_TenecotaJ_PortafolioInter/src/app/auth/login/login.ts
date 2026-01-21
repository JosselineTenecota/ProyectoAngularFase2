import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { User } from '../../core/models/user';

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
    // Si ya está logueado, redirigir
    this.authService.userData$.subscribe(user => {
      // Verifica si el usuario tiene rol (Java) o role (Firebase)
      const rol = user?.rol || user?.role;
      if (rol) {
        this.redirectByRole(rol);
      }
    });
  }

  async loginEmail() {
    try {
      const credenciales: User = { 
        correo: this.email, 
        password: this.password 
      };
      
      console.log("Enviando a Java:", credenciales); // Para depurar

      const response = await this.authService.loginWithJava(credenciales);
      
      if (response && response.token) {
        console.log("Login OK");
        // La redirección ocurre automáticamente por el constructor
      }
    } catch (error) {
      console.error("Error login:", error);
      alert("Credenciales incorrectas o error de conexión.");
    }
  }

  private redirectByRole(role: string) {
    const r = role.toLowerCase(); 
    if (r === 'programador') {
        this.router.navigate(['/programador']);
    } else if (r === 'admin') {
        this.router.navigate(['/admin']);
    } else {
        this.router.navigate(['/']);
    }
  }
  
  // Método vacío para el botón de Google (para que no de error el HTML)
  loginGoogle() {}
}