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

  // Redirección centralizada
  private redirectByRole(rol: string) {
  if (!rol) return;
  
  const roleLower = rol.toLowerCase().trim();
  console.log('Procesando rol:', roleLower);
  
  if (roleLower === 'admin') {
    this.router.navigate(['/admin']);
  } else if (roleLower === 'programador') {
    this.router.navigate(['/programador']);
  } else if (roleLower === 'cliente') { // Agregamos explícitamente el caso CLIENTE
    console.log('Redirigiendo a Vista de Cliente...');
    this.router.navigate(['/agendar']); 
  } else {
    console.log('Rol no reconocido:', roleLower);
    this.router.navigate(['/']);
  }
}

  async loginGoogle() {
    try {
      const userRes = await this.authService.loginWithGoogle();
      
      if (userRes && userRes.rol) {
        // Forzamos la redirección inmediata tras el éxito
        this.redirectByRole(userRes.rol);
      }
    } catch (error) {
      console.error('Error en el componente login:', error);
      alert("El usuario no existe en la base de datos local.");
    }
  }

  async loginEmail() {
    try {
      const credenciales: User = { correo: this.email, password: this.password };
      const user = await this.authService.loginWithJava(credenciales);
      if (user && user.rol) {
        this.redirectByRole(user.rol);
      }
    } catch (error) {
      alert("Credenciales incorrectas.");
    }
  }
}