import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Proyecto } from '../models/proyecto.interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProyectosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/proyectos`;

  // Obtener proyectos filtrados por cédula
  getProyectosPorProgramador(cedula: string): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.apiUrl}/usuario/${cedula}`);
  }

  // Crear proyecto enviando cédula como QueryParam
  crearProyecto(proyecto: any, cedula: string): Observable<any> {
    return this.http.post(`${this.apiUrl}?cedula=${cedula}`, proyecto);
  }

  // Eliminar proyecto por ID técnico
  eliminar(codigo: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${codigo}`);
  }

  // Actualizar datos del proyecto
  actualizar(proyecto: Proyecto): Observable<any> {
    return this.http.put(this.apiUrl, proyecto);
  }
}