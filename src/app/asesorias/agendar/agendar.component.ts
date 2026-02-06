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
  public minDate: string = new Date().toISOString().split('T')[0];
  
  public solicitud: any = { 
    programadorCedula: '', 
    fecha: '', 
    hora: '', 
    tema: '' 
  };

  ngOnInit(): void {
    this.cargarProgramadores();
  }

  actualizarHorariosDisponibles(): void {
    console.log("Actualizando horarios para la fecha seleccionada.");
  }

  cargarProgramadores(): void {
    this.usuariosService.listarUsuarios().subscribe({
      next: (res: any[]) => {
        // Buscamos el rol PROGRAMADOR de forma flexible
        this.programadores = res.filter((u: any) => {
          const rol = (u.rol || u.persona?.rol || u.per_rol || '').toUpperCase();
          return rol === 'PROGRAMADOR';
        });
        console.log("Programadores cargados para el select:", this.programadores);
      },
      error: (err: any) => console.error("Error:", err)
    });
  }

  enviarSolicitud(): void {
    if (!this.solicitud.programadorCedula || !this.solicitud.fecha || !this.solicitud.tema) {
      alert("Por favor completa los campos");
      return;
    }

    const fechaHoraIso = `${this.solicitud.fecha}T${this.solicitud.hora || '08:00'}:00`;

    const payload = {
      tema: this.solicitud.tema,
      fechaHora: fechaHoraIso,
      estado: 'PENDIENTE',
      cliente: { cedula: this.authService.currentUser?.cedula },
      programador: { cedula: this.solicitud.programadorCedula }
    };

    this.asesoriasService.crearAsesoria(payload).subscribe({
      next: () => {
        alert("¡Asesoría agendada!");
        this.router.navigate(['/cliente/inicio']);
      },
      error: (err: any) => console.error("Error al agendar", err)
    });
  }
}