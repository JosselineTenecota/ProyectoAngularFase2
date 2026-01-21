import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-agendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendar.component.html',
  styleUrls: ['./agendar.component.scss']
})
export class AgendarComponent implements OnInit {
  
  private authService = inject(AuthService);
  private router = inject(Router);

  // Variables básicas para que el HTML no falle
  programadores: any[] = []; 
  horariosDisponibles: string[] = [];
  minDate: string = '';
  solicitud: any = { programadorId: '', fecha: '', hora: '', tema: '' };

  ngOnInit() {
    // Solo verificamos si hay sesión para que no te bote
    this.checkLogin();
  }

  checkLogin() {
    const token = localStorage.getItem('token');
    const user = this.authService.currentUser;

    if (!token && !user) {
      // Si no hay login, redirigir
      this.router.navigate(['/login']);
    } else {
      console.log("Usuario logueado, listo para agendar (Lógica pendiente)");
    }
  }

  // Métodos vacíos para que el HTML no de error al hacer click
  actualizarHorariosDisponibles() {}
  
  enviarSolicitud() {
    alert("Funcionalidad de Agendar en construcción...");
  }
}