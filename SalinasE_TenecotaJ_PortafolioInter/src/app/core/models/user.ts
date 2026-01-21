export interface User {
  // Campos para Java (Backend Actual)
  cedula?: string;
  nombre?: string;
  correo?: string;
  password?: string;
  rol?: string;
  descripcion?: string;
  especialidad?: string;
  horaInicio?: string;
  horaFin?: string;
  foto?: string;

  // Campos para Firebase (Compatibilidad Fase 1)
  uid?: string;
  name?: string;
  email?: string;
  photoURL?: string | null;
  role?: string;
  
  [key: string]: any;
}

export interface LoginResponse {
    token: string;
    rol: string;
}