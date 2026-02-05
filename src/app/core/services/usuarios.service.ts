import { HttpClient } from "@angular/common/http";
import { RegistroDTO } from "../models/registro.dto";
import { Usuario } from "../models/usuario.model";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/gproyectos/api/usuarios'; // Sin / al final


  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  // Este método ahora entiende que la info está en u.persona

  listarProgramadores(): Observable<any[]> {
    // Esto construirá: http://localhost:8080/gproyectos/api/usuarios/programadores
    return this.http.get<any[]>(`${this.api}/programadores`);
  }

  registrar(dto: RegistroDTO): Observable<any> {
    return this.http.post<any>(`${this.api}/crear`, dto);
  }

  buscarPorCorreo(correo: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.api}/${encodeURIComponent(correo)}`);
  }

  actualizar(usuario: Partial<Usuario> & { correo: string }): Observable<any> {
    return this.http.put<any>(this.api, usuario);
  }

  eliminar(correo: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/${encodeURIComponent(correo)}`);
  }
}