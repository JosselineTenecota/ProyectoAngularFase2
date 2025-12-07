import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, deleteDoc, doc, query, where, collectionData, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Proyecto } from '../../core/models/proyecto.interface';
import { Asesoria } from '../../core/models/asesoria.interface'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  projects$!: Observable<Proyecto[]>;
  asesorias$!: Observable<Asesoria[]>;
  currentUser: any;

  // Objeto para el formulario
  newProject: Proyecto = {
    programmerId: '',
    titulo: '',
    descripcion: '',
    tipo: 'Academico',
    participacion: 'Frontend', // Valor por defecto
    tecnologias: '',
    repoUrl: '',
    demoUrl: ''
  };

  ngOnInit() {
    this.currentUser = this.auth.currentUser;
    
    if (this.currentUser) {
      this.loadMyProjects();
      this.loadMisAsesorias();
    }
  }

  loadMyProjects() {
    const projectsRef = collection(this.firestore, 'projects');
    // Carga solo los proyectos de este programador
    const q = query(projectsRef, where('programmerId', '==', this.currentUser.uid));
    this.projects$ = collectionData(q, { idField: 'id' }) as Observable<Proyecto[]>;
  }

  loadMisAsesorias() {
    const asesoriasRef = collection(this.firestore, 'asesorias');
    // Carga las solicitudes dirigidas a este programador
    const q = query(asesoriasRef, where('programadorId', '==', this.currentUser.uid));
    this.asesorias$ = collectionData(q, { idField: 'id' }) as Observable<Asesoria[]>;
  }

  // --- LÓGICA DE RESPUESTA Y SIMULACIÓN (Requerimiento 6) ---
  async responderAsesoria(asesoria: Asesoria, estado: 'Aprobada' | 'Rechazada') {
    // 1. Pedir mensaje opcional (Nativo)
    const mensaje = prompt(`Escribe un mensaje de ${estado.toLowerCase()} (Opcional):`);
    
    // Referencia al documento en Firebase
    const docRef = doc(this.firestore, `asesorias/${asesoria.id}`);
    
    try {
      // 2. Actualizar en Base de Datos
      await updateDoc(docRef, {
        estado: estado,
        respuesta: mensaje || ''
      });

      // 3. Simulación de Correo (Alerta visual)
      alert(`✅ SIMULACIÓN: Enviando correo de notificación a ${asesoria.clienteEmail}...\n\nAsunto: Tu asesoría fue ${estado}.\nMensaje: ${mensaje || 'Sin comentarios.'}`);

      // 4. Simulación de WhatsApp (Confirmación para abrir link)
      if (confirm('¿Deseas notificar al usuario por WhatsApp Web ahora?')) {
        const textoWhatsapp = `Hola ${asesoria.clienteNombre}, tu solicitud de asesoría ha sido *${estado.toUpperCase()}*. ${mensaje ? 'Nota: ' + mensaje : ''}`;
        const url = `https://wa.me/?text=${encodeURIComponent(textoWhatsapp)}`;
        window.open(url, '_blank');
      }

    } catch (error) {
      console.error(error);
      alert('Error al actualizar la cita');
    }
  }

  // --- AGREGAR PROYECTO ---
  async addProject() {
    // Validación de seguridad
    if (!this.newProject.titulo || !this.newProject.descripcion) {
      alert('El título y la descripción son obligatorios');
      return;
    }

    try {
      // Asignamos el ID del usuario actual al proyecto
      this.newProject.programmerId = this.currentUser.uid;
      
      const projectsRef = collection(this.firestore, 'projects');
      await addDoc(projectsRef, this.newProject);
      
      alert('Proyecto agregado con éxito');
      this.resetForm();
    } catch (error) {
      console.error(error);
      alert('Error al guardar');
    }
  }

  // --- ELIMINAR PROYECTO ---
  async deleteProject(projectId: string) {
    if (confirm('¿Eliminar este proyecto? No se puede deshacer.')) {
      const docRef = doc(this.firestore, `projects/${projectId}`);
      await deleteDoc(docRef);
    }
  }

  // --- RESETEAR FORMULARIO ---
  resetForm() {
    this.newProject = {
      programmerId: '',
      titulo: '',
      descripcion: '',
      tipo: 'Academico',
      participacion: 'Frontend', // Reseteamos al valor por defecto
      tecnologias: '',
      repoUrl: '',
      demoUrl: ''
    };
  }
}