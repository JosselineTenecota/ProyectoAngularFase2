export interface Programador {
  uid: string;
  displayName: string;
  photoURL?: string;
  email: string;
  specialty?: string;
  description?: string;
  role: 'admin' | 'programador' | 'usuario';
  
  // Rango de Horarios
  horaInicio?: string;
  horaFin?: string;
  
  // --- NUEVOS CAMPOS ---
  contactUrl?: string; // Ej: WhatsApp link o teléfono
  socialUrl?: string;  // Ej: LinkedIn o GitHub
  // -------------------

  horarios?: string;
  createdAt?: any;
}