export interface User {
  uid: string;
  name?: string;
  email?: string;
  photoURL?: string | null;
  role?: 'admin' | 'programador' | 'usuario' | string;
  createdAt?: any;
  [key: string]: any; // opcional si hay campos extra
}
