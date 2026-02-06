import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { AsesoriasService } from '../../core/services/asesorias';
import { UsuariosService } from '../../core/services/usuarios.service';

@Component({
  selector: 'app-agendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendar.component.html',
  styleUrls: ['./agendar.component.scss']
})
export class AgendarComponent implements OnInit {
  private authService = inject(AuthService);
  private asesoriasService = inject(AsesoriasService);
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);

  public programadores: any[] = []; 
  public horariosDisponibles: string[] = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  
  public solicitud: any = { 
    programadorCedula: '', 
    fecha: '', 
    hora: '', 
    tema: '' 
  };

  ngOnInit(): void {
    this.cargarProgramadores();
  }

  cargarProgramadores(): void {
    this.usuariosService.listarUsuarios().subscribe({
      next: (res: any[]) => {
        this.programadores = res.filter((u: any) => {
          const rol = (u.rol || u.persona?.rol || u.per_rol || '').toUpperCase();
          return rol === 'PROGRAMADOR';
        });
      },
      error: (err: any) => console.error("Error al cargar expertos", err)
    });
  }

  actualizarHorariosDisponibles(): void {
    // Este método lo llama el (change) del HTML
  }

  enviarSolicitud(): void {
    // IMPORTANTE: Java LocalDateTime requiere segundos (:00)
    const fechaHoraIso = `${this.solicitud.fecha}T${this.solicitud.hora}:00`;

    const payload = {
      tema: this.solicitud.tema,
      fechaHora: fechaHoraIso,
      estado: 'PENDIENTE',
      cliente: { 
        cedula: this.authService.currentUser?.cedula || localStorage.getItem('cedula') 
      },
      programador: { 
        cedula: this.solicitud.programadorCedula 
      }
    };

    this.asesoriasService.crearAsesoria(payload).subscribe({
      next: () => {
        alert("¡Asesoría agendada con éxito!");
        this.router.navigate(['/cliente/inicio']);
      },
      error: (err: any) => {
        console.error("Error 400:", err);
        alert("Error al agendar. Revisa la consola para más detalles.");
      }
    });
  }
}