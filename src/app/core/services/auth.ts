import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginResponse, User } from '../models/user';
import { firstValueFrom, tap } from 'rxjs';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

// Firebase Imports
import { Auth, signOut, onAuthStateChanged } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private auth = inject(Auth); 
  private router = inject(Router);

  private apiUrl = `${environment.apiUrl}/auth`; 

  // Estado del usuario
  private userData = new BehaviorSubject<any>(null);
  userData$ = this.userData.asObservable();

  // --- GETTER 1: Para obtener el objeto usuario completo ---
  get currentUser() {
    return this.userData.value;
  }

  // --- GETTER 2: (SOLUCIÓN) Para que el Navbar detecte el rol ---
  get currentRole(): string | null {
    const user = this.userData.value;
    if (!user) return null;
    
    // Java usa 'rol', Firebase usa 'role'. Normalizamos a minúsculas.
    const r = user.rol || user.role || '';
    return r.toLowerCase();
  }

  constructor() {
    // Restaurar sesión al recargar página
    onAuthStateChanged(this.auth, (firebaseUser) => {
      const javaToken = localStorage.getItem('token');
      const javaRol = localStorage.getItem('rol');

      if (javaToken && javaRol) {
        // Sesión Java
        this.userData.next({ role: javaRol, rol: javaRol, token: javaToken, ...this.decodeToken(javaToken) });
      } else if (firebaseUser) {
        // Sesión Firebase
        this.userData.next(firebaseUser);
      } else {
        this.userData.next(null);
      }
    });
  }

  // Login Java
  async loginWithJava(user: User): Promise<LoginResponse> {
    return firstValueFrom(
      this.http.post<LoginResponse>(`${this.apiUrl}/login`, user).pipe(
        tap(res => {
          if (res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('rol', res.rol);
            // Guardamos ambos campos (rol y role) para compatibilidad
            this.userData.next({ role: res.rol, rol: res.rol, token: res.token, ...this.decodeToken(res.token) });
          }
        })
      )
    );
  }

  // Utilidad para sacar datos del token (Nombre, email, etc.)
  private decodeToken(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { 
        nombre: payload.nombre, // Asegúrate que en Java TokenUtils pongas "nombre"
        cedula: payload.sub 
      }; 
    } catch { return {}; }
  }

  // Métodos de compatibilidad
  async loginWithGoogle() {} // Implementar si lo usas
  async loginWithEmail() {} // Implementar si lo usas

  async logout() {
    try {
      await signOut(this.auth);
      localStorage.clear();
      this.userData.next(null);
      this.router.navigate(['/login'], { replaceUrl: true });
    } catch (error) {
      console.error('Error logout', error);
    }
  }
}