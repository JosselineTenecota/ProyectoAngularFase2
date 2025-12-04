import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar {
  // Asegúrate de que sea 'public' para que el HTML no de error
  public auth = inject(AuthService);
  
  // Esta es la variable clave. Si la tienes como private, cámbiala a public
  public user$ = this.auth.userData$; 

  // ... (resto del código logout, menuOpen, etc)
  logout() {
    this.auth.logout(); 
  }
}

