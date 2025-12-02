// ... imports (los mismos de antes)
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
  // ... inyecciones (igual que antes)
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private router = inject(Router);

  programadores: Programador[] = [];
  
  // Lista de horas
  horariosDisponibles: string[] = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // NUEVO: Variable para bloquear fechas pasadas en el HTML
  minDate: string = '';

  solicitud: any = {
    programadorId: '',
    fecha: '',
    hora: '',
    tema: ''
  };

  ngOnInit() {
    this.cargarProgramadores();
    this.calcularFechaMinima(); // <--- Llamamos a la función al iniciar
  }

  // NUEVO: Calcula la fecha de hoy en formato YYYY-MM-DD
  calcularFechaMinima() {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    this.minDate = `${yyyy}-${mm}-${dd}`;
  }

  // ... cargarProgramadores() sigue igual ...
  async cargarProgramadores() {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('role', '==', 'programador'));
    const snapshot = await getDocs(q);
    this.programadores = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Programador));
  }

  async enviarSolicitud() {
    const user = this.auth.currentUser;

    if (!user) {
      alert('Debes iniciar sesión para agendar una asesoría.');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.solicitud.programadorId || !this.solicitud.fecha || !this.solicitud.hora || !this.solicitud.tema) {
      alert('Por favor completa todos los campos.');
      return;
    }

    // --- NUEVA VALIDACIÓN DE FECHA Y HORA ---
    // Creamos una fecha combinando lo que eligió el usuario
    const fechaSeleccionada = new Date(this.solicitud.fecha + 'T' + this.solicitud.hora);
    const ahora = new Date();

    // Comparamos si la fecha seleccionada ya pasó
    if (fechaSeleccionada < ahora) {
      alert("No puedes agendar una cita a un dia u hora anterior.");
      return; // Detenemos la función aquí
    }
    // ----------------------------------------

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
      await addDoc(collection(this.firestore, 'asesorias'), nuevaAsesoria);
      alert('¡Solicitud enviada! El programador revisará tu petición.');
      this.router.navigate(['/']); 
    } catch (error) {
      console.error(error);
      alert('Error al enviar la solicitud.');
    }
  }
}