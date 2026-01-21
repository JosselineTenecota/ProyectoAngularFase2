export interface Programador {
  uid: string;         // Viene de Firebase (id del usuario)
  displayName: string; // Nombre público
  email: string;
  role: string;        // "programador"
  specialty?: string;  // Gamer, Backend, Frontend, etc.
  description?: string;
  horarios?: string;
  photoURL?: string;
  createdAt?: any;     // Puede ser FieldValue o Timestamp
}
