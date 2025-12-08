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

  // Necesario para leer login/rol en el HTML
  public auth = inject(AuthService);

  //Observable del usuario (úsalo en *ngIf="user$ | async")
  public user$ = this.auth.userData$;

  // Controla si el menú móvil está abierto o cerrado
  public menuOpen: boolean = false;

  constructor() { }


  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }


  logout() {
    this.auth.logout();
  }
}
