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
  
  // Lista Completa
  horasMaestras: string[] = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Lista Filtrada (Se llena dinámicamente)
  horariosDisponibles: string[] = [];

  minDate: string = '';
  solicitud: any = { programadorId: '', fecha: '', hora: '', tema: '' };

  ngOnInit() {
    this.cargarProgramadores();
    
    // Calcular fecha mínima (hoy)
    const hoy = new Date();
    this.minDate = hoy.toISOString().split('T')[0];
  }

  async cargarProgramadores() {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('role', '==', 'programador'));
    const snapshot = await getDocs(q);
    this.programadores = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Programador));
  }

  // --- FILTRADO DE HORAS ---
  actualizarHorariosDisponibles() {
    const prog = this.programadores.find(p => p.uid === this.solicitud.programadorId);
    
    if (prog) {
      const inicio = prog.horaInicio || '08:00';
      const fin = prog.horaFin || '17:00';

      // Filtramos: Hora >= Inicio Y Hora < Fin
      this.horariosDisponibles = this.horasMaestras.filter(h => h >= inicio && h < fin);
      
      // Limpiamos la hora seleccionada anteriormente
      this.solicitud.hora = ''; 
    }
  }

  async enviarSolicitud() {
    // ... (Tu lógica de validación y envío sigue igual)
    const user = this.auth.currentUser;
    if (!user) { alert('Inicia sesión'); return; }
    
    // Validaciones...
    if (!this.solicitud.hora) { alert('Falta la hora'); return; }

    try {
        const progSeleccionado = this.programadores.find(p => p.uid === this.solicitud.programadorId);
        await addDoc(collection(this.firestore, 'asesorias'), {
            clienteId: user.uid,
            clienteNombre: user.displayName,
            clienteEmail: user.email,
            programadorId: this.solicitud.programadorId,
            programadorNombre: progSeleccionado?.displayName,
            fecha: this.solicitud.fecha,
            hora: this.solicitud.hora,
            tema: this.solicitud.tema,
            estado: 'Pendiente'
        });
        alert('Solicitud Enviada');
        this.router.navigate(['/mis-asesorias']);
    } catch(e) { console.error(e); }
  }
}