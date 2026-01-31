import { HttpClient } from "@angular/common/http";
import { RegistroDTO } from "../models/registro.dto";
import { Usuario } from "../models/usuario.model";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class UsuariosService {

  private api = 'http://localhost:8080/tuApp/api/usuarios';

  constructor(private http: HttpClient) {}

  registrar(dto: RegistroDTO) {
    return this.http.post<any>(`${this.api}/crear`, dto);
  }

  listar() {
    return this.http.get<Usuario[]>(this.api);
  }

  buscarPorCorreo(correo: string) {
    return this.http.get<Usuario>(`${this.api}/${correo}`);
  }

  actualizar(usuario: Partial<Usuario> & { correo: string; password?: string }) {
    return this.http.put<any>(this.api, usuario);
  }

  eliminar(correo: string) {
    return this.http.delete<any>(`${this.api}/${correo}`);
  }
}
