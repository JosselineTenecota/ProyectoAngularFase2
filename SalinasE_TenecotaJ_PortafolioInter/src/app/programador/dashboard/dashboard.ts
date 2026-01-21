import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, deleteDoc, doc, query, where, collectionData, updateDoc } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';
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

  // Observables para las listas
  academicos$: Observable<Proyecto[]> = of([]);
  laborales$: Observable<Proyecto[]> = of([]);
  asesorias$: Observable<Asesoria[]> = of([]);
  
  currentUser: any;
  
  // Bandera para la validación visual (Borde rojo)
  submitted = false; 

  newProject: Proyecto = {
    programmerId: '', 
    titulo: '', 
    descripcion: '', 
    tipo: 'Academico', 
    participacion: 'Frontend', 
    tecnologias: '', 
    repoUrl: '', 
    demoUrl: ''
  };

  ngOnInit() {
    // Esperamos a que Firebase cargue el usuario para evitar errores
    authState(this.auth).subscribe(user => {
      if(user) {
        this.currentUser = user;
        this.loadMyProjects();
        this.loadMisAsesorias();
      }
    });
  }

  // --- CARGAR PROYECTOS Y SEPARARLOS ---
  loadMyProjects() {
    const projectsRef = collection(this.firestore, 'projects');
    const q = query(projectsRef, where('programmerId', '==', this.currentUser.uid));
    
    // Obtenemos todos
    const allProjects$ = collectionData(q, { idField: 'id' }) as Observable<Proyecto[]>;

    // Filtramos Académicos
    this.academicos$ = allProjects$.pipe(
      map(projects => projects.filter(p => p.tipo === 'Academico'))
    );

    // Filtramos Laborales
    this.laborales$ = allProjects$.pipe(
      map(projects => projects.filter(p => p.tipo === 'Laboral'))
    );
  }

  // --- CARGAR SOLICITUDES DE ASESORÍA ---
  loadMisAsesorias() {
    const asesoriasRef = collection(this.firestore, 'asesorias');
    const q = query(asesoriasRef, where('programadorId', '==', this.currentUser.uid));
    this.asesorias$ = collectionData(q, { idField: 'id' }) as Observable<Asesoria[]>;
  }

  // --- AGREGAR PROYECTO ---
  async addProject() {
    // 1. Activar validación visual (Borde rojo en HTML)
    this.submitted = true;

    // 2. Validación lógica
    if (!this.newProject.titulo || !this.newProject.descripcion) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Por favor completa los campos marcados en rojo.',
        confirmButtonColor: '#ffb300'
      });
      return;
    }

    try {
      this.newProject.programmerId = this.currentUser.uid;
      await addDoc(collection(this.firestore, 'projects'), this.newProject);
      
      Swal.fire({
        icon: 'success',
        title: '¡Publicado!',
        text: 'Proyecto agregado correctamente.',
        timer: 1500,
        showConfirmButton: false
      });
      
      this.resetForm();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo guardar el proyecto', 'error');
    }
  }

  // --- ELIMINAR PROYECTO ---
  async deleteProject(projectId: string) {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      await deleteDoc(doc(this.firestore, `projects/${projectId}`));
      Swal.fire('Eliminado', 'Proyecto borrado.', 'success');
    }
  }

  // --- RESPONDER ASESORÍA (CON SIMULACIÓN) ---
  async responderAsesoria(asesoria: Asesoria, estado: 'Aprobada' | 'Rechazada') {
    
    // 1. Pedir mensaje
    const { value: mensaje } = await Swal.fire({
      title: `Confirmar como ${estado}`,
      input: 'textarea',
      inputLabel: 'Mensaje para el usuario:',
      inputPlaceholder: 'Escribe aquí...',
      showCancelButton: true,
      confirmButtonText: 'Enviar Respuesta',
      confirmButtonColor: estado === 'Aprobada' ? '#66bb6a' : '#ef5350'
    });

    if (mensaje === undefined) return; // Cancelado
    
    try {
      // 2. Actualizar BD
      await updateDoc(doc(this.firestore, `asesorias/${asesoria.id}`), {
        estado: estado,
        respuesta: mensaje || ''
      });

      // 3. Simulación Correo
      await Swal.fire({
        icon: 'info',
        title: '✉️ Simulación de Correo',
        html: `
          <div style="text-align: left">
            <p><strong>Enviando a:</strong> ${asesoria.clienteEmail}</p>
            <p><strong>Asunto:</strong> Tu asesoría fue ${estado}</p>
            <hr>
            <p><em>${mensaje || 'Sin comentarios.'}</em></p>
          </div>
        `,
        confirmButtonText: 'Continuar'
      });

      // 4. Simulación WhatsApp
      const result = await Swal.fire({
        icon: 'question',
        title: 'WhatsApp',
        text: '¿Deseas notificar por WhatsApp Web?',
        showCancelButton: true,
        confirmButtonText: 'Sí, abrir',
        confirmButtonColor: '#25D366',
        cancelButtonText: 'No'
      });

      if (result.isConfirmed) {
        const txt = `Hola ${asesoria.clienteNombre}, tu solicitud fue *${estado.toUpperCase()}*. ${mensaje}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank');
      }

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo actualizar', 'error');
    }
  }

  resetForm() {
    this.submitted = false; // Resetear bandera visual
    this.newProject = {
      programmerId: '', 
      titulo: '', 
      descripcion: '', 
      tipo: 'Academico', 
      participacion: 'Frontend', 
      tecnologias: '', 
      repoUrl: '', 
      demoUrl: ''
    };
  }
}