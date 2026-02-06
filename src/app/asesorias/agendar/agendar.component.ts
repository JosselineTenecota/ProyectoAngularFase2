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
  // Ensure strict ISO format for Java LocalDateTime (YYYY-MM-DDTHH:mm:ss)
  const fechaHoraIso = `${this.solicitud.fecha}T${this.solicitud.hora}:00`;

  // Get current client ID from service or storage
  const cedulaCliente = this.authService.currentUser?.cedula || localStorage.getItem('cedula');

  // Verify the property names 'cliente' and 'programador' match your Java Entity variables exactly
  const payload = {
    tema: this.solicitud.tema,
    fechaHora: fechaHoraIso,
    estado: 'PENDIENTE',
    cliente: { 
      cedula: cedulaCliente 
    },
    programador: { 
      cedula: this.solicitud.programadorCedula 
    }
  };

  console.log("Enviando JSON al servidor:", JSON.stringify(payload));

  this.asesoriasService.crearAsesoria(payload).subscribe({
    next: () => {
      alert("¡Asesoría agendada con éxito!");
      this.router.navigate(['/cliente/inicio']);
    },
    error: (err: any) => {
      console.error("Detalle del error 400:", err);
      // Helpful tip: Check the 'Network' tab in Chrome for the specific field error
      alert("Error al agendar: El servidor no pudo procesar los datos.");
    }
  });
}
}