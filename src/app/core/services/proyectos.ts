import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Proyecto } from '../models/proyecto.interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProyectosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/proyectos`;

  getProyectosPorProgramador(cedula: string): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.apiUrl}/programador/${cedula}`);
  }

  crearProyecto(proyecto: Proyecto, correo: string): Observable<any> {
    // IMPORTANTE: El correo se envía como ?correo=...
    return this.http.post(`${this.apiUrl}?correo=${correo}`, proyecto);
  }

  eliminar(codigo: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${codigo}`);
  }
}