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
    participacion: 'Frontend', // <--- VALOR POR DEFECTO
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
    const q = query(projectsRef, where('programmerId', '==', this.currentUser.uid));
    this.projects$ = collectionData(q, { idField: 'id' }) as Observable<Proyecto[]>;
  }

  loadMisAsesorias() {
    const asesoriasRef = collection(this.firestore, 'asesorias');
    const q = query(asesoriasRef, where('programadorId', '==', this.currentUser.uid));
    this.asesorias$ = collectionData(q, { idField: 'id' }) as Observable<Asesoria[]>;
  }

  async responderAsesoria(asesoriaId: string, estado: 'Aprobada' | 'Rechazada') {
    const mensaje = prompt(`Escribe un mensaje de ${estado.toLowerCase()} (Opcional):`);
    const docRef = doc(this.firestore, `asesorias/${asesoriaId}`);
    try {
      await updateDoc(docRef, {
        estado: estado,
        respuesta: mensaje || ''
      });
      alert(`La asesoría ha sido ${estado}`);
    } catch (error) {
      console.error(error);
      alert('Error al actualizar la cita');
    }
  }

  async addProject() {
    if (!this.newProject.titulo || !this.newProject.descripcion) {
      alert('El título y la descripción son obligatorios');
      return;
    }

    try {
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

  async deleteProject(projectId: string) {
    if (confirm('¿Eliminar este proyecto? No se puede deshacer.')) {
      const docRef = doc(this.firestore, `projects/${projectId}`);
      await deleteDoc(docRef);
    }
  }

  resetForm() {
    this.newProject = {
      programmerId: '',
      titulo: '',
      descripcion: '',
      tipo: 'Academico',
      participacion: 'Frontend', // <--- RESETEAR ESTE CAMPO TAMBIÉN
      tecnologias: '',
      repoUrl: '',
      demoUrl: ''
    };
  }
}