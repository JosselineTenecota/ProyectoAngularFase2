import { Persona } from './persona.model';

export interface Usuario {
  correo: string;
  rol: 'ADMIN' | 'PROGRAMADOR' | 'CLIENTE';
  activo: boolean;
  persona: Persona;
}
