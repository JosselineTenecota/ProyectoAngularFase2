export interface RegistroDTO {
  cedula: string;
  nombre: string;
  apellido?: string;
  correo: string;
  password: string;
  rol?: 'ADMIN' | 'PROGRAMADOR' | 'CLIENTE';
}
