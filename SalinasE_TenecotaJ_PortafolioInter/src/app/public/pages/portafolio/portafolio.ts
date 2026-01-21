import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc, collection, query, where, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Programador } from '../../../core/models/programador.interface';
import { Proyecto } from '../../../core/models/proyecto.interface';

@Component({
  selector: 'app-portafolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portafolio.html',
  styleUrls: ['./portafolio.scss']
})
export class Portafolio implements OnInit {
  private route = inject(ActivatedRoute);
  private firestore = inject(Firestore);

  programmer: Programador | null = null;
  projects$!: Observable<Proyecto[]>;
  loading = true;

  async ngOnInit() {
    // 1. Obtener el ID de la URL
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      await this.loadProfile(id);
      this.loadProjects(id);
    }
  }

  // Cargar datos del usuario (Nombre, Foto, Descripcion)
  async loadProfile(uid: string) {
    const docRef = doc(this.firestore, `users/${uid}`);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      this.programmer = snapshot.data() as Programador;
    }
  }

  // Cargar sus proyectos
  loadProjects(uid: string) {
    const projectsRef = collection(this.firestore, 'projects');
    const q = query(projectsRef, where('programmerId', '==', uid));
    
    this.projects$ = collectionData(q) as Observable<Proyecto[]>;
    this.loading = false;
  }
}