import { HttpClient } from "@angular/common/http";
import { RegistroDTO } from "../models/registro.dto";
import { Usuario } from "../models/usuario.model";
import { Injectable, inject } from "@angular/core";
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  // Usamos inject() para seguir el estilo moderno de Angular 18+
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/gproyectos/api/usuarios';

  // Obtener todos los usuarios (GET /api/usuarios)
  // Cambia el método listar para probar si la ruta es diferente
  listar(): Observable<any[]> {
    // Prueba si tu backend tiene una ruta específica como /todos o /listar
    // Si no la tiene, asegúrate de que en Java el @GET no tenga @Path o sea @Path("/")
    return this.http.get<any[]>(this.api);
  }

  // Crear usuario (POST /api/usuarios/crear)
  // Asegúrate de que el DTO coincida con lo que espera tu Java
  registrar(dto: RegistroDTO): Observable<any> {
    return this.http.post<any>(`${this.api}/crear`, dto);
  }

  // Buscar por correo (GET /api/usuarios/correo@ejemplo.com)
  buscarPorCorreo(correo: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.api}/${encodeURIComponent(correo)}`);
  }

  // Actualizar (PUT /api/usuarios)
  // Nota: Tu backend debe estar preparado para recibir el objeto completo o parcial
  actualizar(usuario: Partial<Usuario> & { correo: string; password?: string }): Observable<any> {
    return this.http.put<any>(this.api, usuario);
  }

  // Eliminar (DELETE /api/usuarios/correo@ejemplo.com)
  eliminar(correo: string): Observable<any> {
    return this.http.delete<any>(`${this.api}/${encodeURIComponent(correo)}`);
  }
}