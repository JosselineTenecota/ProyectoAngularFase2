export interface Programador {
  uid: string;
  displayName: string;
  photoURL?: string;
  email: string;
  specialty?: string;
  description?: string;
  role: 'admin' | 'programador' | 'usuario';
  
  // --- NUEVOS CAMPOS DE RANGO ---
  horaInicio?: string;
  horaFin?: string;
  // -----------------------------
  
  horarios?: string; // (Lo dejamos por si acaso)
  createdAt?: any;
}