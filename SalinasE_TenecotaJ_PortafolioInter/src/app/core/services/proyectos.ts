// proyectos.service.ts
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Proyecto } from '../models/proyecto.interface';

@Injectable({
  providedIn: 'root'
})
export class ProyectosService {
  private firestore = inject(Firestore);

  constructor() {}

  getProyectosPorProgramador(programmerId: string): Observable<Proyecto[]> {
    const proyectosRef = collection(this.firestore, 'projects'); // Asegúrate del nombre exacto de tu colección
    const q = query(proyectosRef, where('programmerId', '==', programmerId));
    return collectionData(q, { idField: 'id' }) as Observable<Proyecto[]>;
  }
}
