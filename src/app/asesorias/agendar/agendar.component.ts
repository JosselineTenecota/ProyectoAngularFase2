import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Firestore, collection, query, where, getDocs, addDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
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
  
  // Todas las horas posibles (El admin recorta esto)
  horasMaestras: string[] = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  
  // Lista que ve el usuario
  horariosDisponibles: string[] = [];
  
  minDate: string = '';
  solicitud: any = { programadorId: '', fecha: '', hora: '', tema: '' };

  ngOnInit() {
    this.cargarProgramadores();
    // Bloquear fechas pasadas
    const hoy = new Date();
    this.minDate = hoy.toISOString().split('T')[0];
  }

  async cargarProgramadores() {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('role', '==', 'programador'));
    const snapshot = await getDocs(q);
    this.programadores = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Programador));
  }

  // --- LÓGICA DE FILTRADO DE HORAS ---
  actualizarHorariosDisponibles() {
    const prog = this.programadores.find(p => p.uid === this.solicitud.programadorId);
    if (prog) {
      // Si el admin configuró rango, lo usamos. Si no, usamos 8 a 17 por defecto.
      const inicio = prog.horaInicio || '08:00';
      const fin = prog.horaFin || '17:00';

      this.horariosDisponibles = this.horasMaestras.filter(h => h >= inicio && h < fin);
      this.solicitud.hora = ''; // Resetear hora
    }
  }

  async enviarSolicitud() {
    const user = this.auth.currentUser;
    if (!user) {
      alert('Debes iniciar sesión para agendar.');
      this.router.navigate(['/login']);
      return;
    }

    // Validar fecha pasada
    const fechaSeleccionada = new Date(this.solicitud.fecha + 'T' + this.solicitud.hora);
    const ahora = new Date();
    if (fechaSeleccionada < ahora) {
      alert("No puedes agendar en el pasado.");
      return;
    }

    try {
        const progSeleccionado = this.programadores.find(p => p.uid === this.solicitud.programadorId);
        
        const nuevaAsesoria: Asesoria = {
            clienteId: user.uid,
            clienteNombre: user.displayName || 'Usuario',
            clienteEmail: user.email || '',
            programadorId: this.solicitud.programadorId,
            programadorNombre: progSeleccionado?.displayName || 'Desconocido',
            fecha: this.solicitud.fecha,
            hora: this.solicitud.hora,
            tema: this.solicitud.tema,
            estado: 'Pendiente'
        };

        await addDoc(collection(this.firestore, 'asesorias'), nuevaAsesoria);
        
        alert('¡Solicitud Enviada!');
        this.router.navigate(['/mis-asesorias']);
    } catch(e) { 
        console.error(e);
        alert('Error al enviar');
    }
  }
}