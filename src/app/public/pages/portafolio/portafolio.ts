import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { Programador } from '../../../core/models/programador.interface';
import { Proyecto } from '../../../core/models/proyecto.interface';
import { ProyectosService } from '../../../core/services/proyectos';

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
  private proyectosService = inject(ProyectosService);

  programmer: Programador | null = null;
  projects$!: Observable<Proyecto[]>;
  loading = true;

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // 1. Cargamos el perfil (Sigue en Firestore por ahora)
      await this.loadProfile(id);
      
      // 2. Cargamos proyectos desde POSTGRES usando el ID (Cédula)
      this.loadProjectsFromPostgres(id);
    }
  }

  async loadProfile(uid: string) {
    try {
      const docRef = doc(this.firestore, `users/${uid}`);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        this.programmer = snapshot.data() as Programador;
      } else {
        // Si no existe en Firestore, creamos un perfil temporal con los datos de Postgres
        this.programmer = {
          displayName: 'Andres Otavalo',
          email: 'aotavalo@ups.edu.ec',
          description: 'Desarrollador de Software'
        } as Programador;
      }
    } catch (e) {
      console.error("Error cargando perfil de Firebase", e);
    }
  }

  loadProjectsFromPostgres(cedula: string) {
    // IMPORTANTE: Aquí llamamos a tu Java
    this.projects$ = this.proyectosService.getProyectosPorProgramador(cedula);
    
    this.projects$.subscribe({
      next: () => this.loading = false,
      error: () => this.loading = false
    });
  }
}