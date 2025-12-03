import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Programador } from '../../core/models/programador.interface';
import { Asesoria } from '../../core/models/asesoria.interface';
import { AsesoriasService } from '../../core/services/asesorias';
import { NotificacionesService } from '../../core/services/notificaciones';

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
  private asesoriasService = inject(AsesoriasService);
  private notificacionesService = inject(NotificacionesService);

  programadores: Programador[] = [];
  horariosDisponibles: string[] = [
    '08:00','09:00','10:00','11:00','12:00',
    '13:00','14:00','15:00','16:00','17:00'
  ];
  minDate: string = '';

  solicitud: any = {
    programadorId: '',
    fecha: '',
    hora: '',
    tema: ''
  };

  ngOnInit() {
    this.cargarProgramadores();
    this.calcularFechaMinima();
  }

  calcularFechaMinima() {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    this.minDate = `${yyyy}-${mm}-${dd}`;
  }

  async cargarProgramadores() {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('role', '==', 'programador'));
    const snapshot = await getDocs(q);
    this.programadores = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Programador));
  }

  async enviarSolicitud() {
    const user = this.auth.currentUser;
    if (!user) {
      alert('Debes iniciar sesión.');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.solicitud.programadorId || !this.solicitud.fecha || !this.solicitud.hora || !this.solicitud.tema) {
      alert('Por favor completa todos los campos.');
      return;
    }

    const fechaSeleccionada = new Date(this.solicitud.fecha + 'T' + this.solicitud.hora);
    if (fechaSeleccionada < new Date()) {
      alert('No puedes agendar en el pasado.');
      return;
    }

    const progSeleccionado = this.programadores.find(p => p.uid === this.solicitud.programadorId);

    const nuevaAsesoria: Asesoria = {
      clienteId: user.uid,
      clienteNombre: user.displayName || 'Usuario Anónimo',
      clienteEmail: user.email || '',
      programadorId: this.solicitud.programadorId,
      programadorNombre: progSeleccionado?.displayName || 'Desconocido',
      fecha: this.solicitud.fecha,
      hora: this.solicitud.hora,
      tema: this.solicitud.tema,
      estado: 'Pendiente'
    };

    try {
      const docRef = await this.asesoriasService.crearAsesoria(nuevaAsesoria);

      // Enviar notificación al programador
      await this.notificacionesService.enviarNotificacion({
        userId: nuevaAsesoria.programadorId,
        type: 'solicitud',
        message: `Nueva solicitud de ${nuevaAsesoria.clienteNombre} sobre "${nuevaAsesoria.tema}" el ${nuevaAsesoria.fecha} a las ${nuevaAsesoria.hora}`,
        relatedAsesoriaId: docRef.id,
        createdAt: new Date(),
        read: false
      });

      alert('¡Solicitud enviada!');
      this.router.navigate(['/']);
    } catch (error) {
      console.error(error);
      alert('Error al enviar la solicitud.');
    }
  }
}
