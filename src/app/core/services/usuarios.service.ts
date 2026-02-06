import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  // Ajusta esta URL si tu API en WildFly es distinta
  private api = 'http://localhost:8080/gproyectos/api/usuarios';

  /**
   * Obtiene la lista completa de usuarios/personas
   */
  listarUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  /**
   * Para el Admin Dashboard (Listar)
   */
  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  /**
   * Para la página pública de Programadores
   */
  listarProgramadores(): Observable<any[]> {
    return this.http.get<any[]>(this.api + '/programadores');
  }

  /**
   * Para el Admin Dashboard (Crear/Registrar)
   */
  registrar(dto: any): Observable<any> {
    return this.http.post<any>(this.api + '/crear', dto);
  }

  /**
   * Para el Admin Dashboard (Eliminar)
   */
  eliminar(correo: string): Observable<any> {
    return this.http.delete<any>(this.api + '/' + encodeURIComponent(correo));
  }

  /**
   * Otros métodos necesarios
   */
  buscarPorCorreo(correo: string): Observable<any> {
    return this.http.get<any>(this.api + '/' + encodeURIComponent(correo));
  }

  actualizar(usuario: any): Observable<any> {
    return this.http.put<any>(this.api, usuario);
  }
}