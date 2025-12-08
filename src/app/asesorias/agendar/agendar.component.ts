import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Firestore, collection, query, where, getDocs, addDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import Swal from 'sweetalert2'; 
import { Programador } from '../../core/models/programador.interface';
import { Asesoria } from '../../core/models/asesoria.interface';

@Component({
  selector: 'app-agendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendar.component.html',
  styleUrls: ['./agendar.component.scss']
})
export class AgendarComponent implements OnInit {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private router = inject(Router);

  programadores: Programador[] = [];
  
  horasMaestras: string[] = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  horariosDisponibles: string[] = [];
  minDate: string = '';
  solicitud: any = { programadorId: '', fecha: '', hora: '', tema: '' };

  ngOnInit() {
    this.cargarProgramadores();
    const hoy = new Date();
    this.minDate = hoy.toISOString().split('T')[0];
  }

  async cargarProgramadores() {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('role', '==', 'programador'));
    const snapshot = await getDocs(q);
    this.programadores = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Programador));
  }

  actualizarHorariosDisponibles() {
    const prog = this.programadores.find(p => p.uid === this.solicitud.programadorId);
    if (prog) {
      const inicio = prog.horaInicio || '08:00';
      const fin = prog.horaFin || '17:00';
      this.horariosDisponibles = this.horasMaestras.filter(h => h >= inicio && h < fin);
      this.solicitud.hora = ''; 
    }
  }

  async enviarSolicitud() {
    const user = this.auth.currentUser;

    // VALIDACIÓN LOGIN
    if (!user) {
      Swal.fire({
        icon: 'info',
        title: 'Inicia Sesión',
        text: 'Para agendar una cita necesitas identificarte.',
        confirmButtonText: 'Ir al Login'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    // VALIDACIÓN CAMPOS VACÍOS
    if (!this.solicitud.programadorId || !this.solicitud.fecha || !this.solicitud.hora || !this.solicitud.tema) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Por favor completa todos los campos del formulario.',
        confirmButtonColor: '#ffb300'
      });
      return;
    }

    // VALIDACIÓN DE FECHA
    const fechaSeleccionada = new Date(this.solicitud.fecha + 'T' + this.solicitud.hora);
    const ahora = new Date();
    if (fechaSeleccionada < ahora) {
      Swal.fire({
        icon: 'error',
        title: 'Fecha Inválida',
        text: 'No puedes agendar una cita en el pasado.',
      });
      return;
    }

    try {
        const progSeleccionado = this.programadores.find(p => p.uid === this.solicitud.programadorId);
        
        await addDoc(collection(this.firestore, 'asesorias'), {
            clienteId: user.uid,
            clienteNombre: user.displayName || 'Usuario',
            clienteEmail: user.email,
            programadorId: this.solicitud.programadorId,
            programadorNombre: progSeleccionado?.displayName || 'Desconocido',
            fecha: this.solicitud.fecha,
            hora: this.solicitud.hora,
            tema: this.solicitud.tema,
            estado: 'Pendiente'
        });

        // ÉXITO
        Swal.fire({
          icon: 'success',
          title: '¡Solicitud Enviada!',
          text: 'Puedes ver el estado en la sección "Mis Solicitudes".',
          confirmButtonText: 'Entendido'
        }).then(() => {
          this.router.navigate(['/mis-asesorias']);
        });

    } catch(e) { 
      console.error(e);
      Swal.fire('Error', 'Hubo un problema al enviar la solicitud', 'error');
    }
  }
}