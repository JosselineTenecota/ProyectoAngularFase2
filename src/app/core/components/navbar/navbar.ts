import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar {
  // 1. Inyectamos el servicio como PUBLIC para que el HTML acceda a auth.currentRole
  public auth = inject(AuthService);

  // 2. Propiedad para controlar el menú desplegable en móviles
  public menuOpen: boolean = false;

  // 3. Método para abrir/cerrar el menú (Hamburger)
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // 4. Método para cerrar sesión que llama al servicio
  logout() {
    this.auth.logout();
    this.menuOpen = false; // Cerramos el menú por si acaso estaba abierto
  }
}