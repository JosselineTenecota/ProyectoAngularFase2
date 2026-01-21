import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AsesoriasService {
  
  private http = inject(HttpClient);
  
  // Conexión a WildFly: http://localhost:8080/gproyectos/api/asesorias
  private apiUrl = `${environment.apiUrl}/asesorias`;

  constructor() { }

  // -------------------------------------------------------------------------
  // 1. CREAR ASESORÍA (POST)
  // Reemplaza a: addDoc(collection(...))
  // -------------------------------------------------------------------------
  crearAsesoria(asesoria: any): Observable<any> {
    return this.http.post(this.apiUrl, asesoria);
  }

  // -------------------------------------------------------------------------
  // 2. OBTENER ASESORÍAS (GET)
  // Reemplaza a: getDocs(query(...))
  // -------------------------------------------------------------------------
  // Nota: Como tu Backend Java (por ahora) devuelve TODAS las asesorías en el listar(),
  // hacemos el filtrado aquí en el cliente (Frontend) usando RxJS 'map'.
  getSolicitudesPendientes(programadorCedula: string): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(lista => lista.filter(a => 
        // Verificamos que sea del programador y que esté pendiente
        // (Asegúrate que Java devuelva 'programador' con 'cedula')
        a.programador?.cedula === programadorCedula && 
        (a.estado === 'PENDIENTE' || a.estado === 'Pendiente')
      ))
    );
  }

  // Método genérico para listar todas (útil para Admin o Cliente)
  getAsesorias(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // -------------------------------------------------------------------------
  // 3. ACTUALIZAR ESTADO (PUT)
  // Reemplaza a: updateDoc(...)
  // -------------------------------------------------------------------------
  // Java espera el objeto completo en el PUT.
  // 'id' es el código numérico de la asesoría (ej. 1, 2...)
  actualizarAsesoria(id: number, asesoriaCompleta: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, asesoriaCompleta);
  }
}