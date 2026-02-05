import { Injectable, inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginResponse, User } from '../models/user';
import { firstValueFrom, tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private auth = inject(Auth);
  private router = inject(Router);
  private zone = inject(NgZone);

  private apiUrl = `${environment.apiUrl}/usuarios`;

  // Estado reactivo del usuario para toda la aplicación
  private userData = new BehaviorSubject<any>(null);
  userData$ = this.userData.asObservable();

  // En el constructor del AuthService.ts
constructor() {
  onAuthStateChanged(this.auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      // 1. Firebase dice que el token es válido, pero vamos a preguntar a JAVA
      const javaRol = localStorage.getItem('rol');
      const userDataStored = localStorage.getItem('user_db'); // Aquí guardaremos el objeto de Postgres

      if (userDataStored) {
        // 2. Si ya tenemos los datos de Postgres en el navegador, los cargamos
        this.userData.next(JSON.parse(userDataStored));
      } else {
        // 3. Si no los tenemos, obligamos a una sincronización con el backend
        this.sincronizarConJava(firebaseUser.email, firebaseUser.displayName);
      }
    } else {
      this.userData.next(null);
      localStorage.clear();
    }
  });
}

// Método auxiliar para asegurar que los datos vengan de TU base de datos
private async sincronizarConJava(correo: string | null, nombre: string | null) {
  try {
    const res = await firstValueFrom(
      this.http.post<any>(`${this.apiUrl}/login-social`, { correo, nombre })
    );
    if (res) {
      const userFinal = { ...res, rol: res.rol.toLowerCase() };
      localStorage.setItem('rol', userFinal.rol);
      localStorage.setItem('user_db', JSON.stringify(userFinal));
      this.userData.next(userFinal);
    }
  } catch (e) {
    console.error("Error: Java no reconoce este usuario", e);
    this.logout();
  }
}

  // Getters para acceso rápido
  get currentUser() {
    return this.userData.value;
  }

  get currentRole(): string | null {
    const user = this.userData.value;
    return user ? (user.rol || '').toLowerCase() : null;
  }

  /**
   * LOGIN CON GOOGLE
   * 1. Autentica en Firebase.
   * 2. Envía datos al Backend Java para validación o auto-registro.
   */
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);

      // Preparamos el payload con los campos que espera el LoginDTO en Java
      const payload = {
        correo: result.user.email,
        nombre: result.user.displayName || 'Usuario de Google'
      };

      console.log("Sincronizando con Backend Java...", payload.correo);

      // Llamada al endpoint login-social corregido
      const res = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/login-social`, payload)
      );

      if (res && res.rol) {
        const roleNormalized = res.rol.toLowerCase();
        
        // Guardamos en persistencia local
        localStorage.setItem('rol', roleNormalized);
        if (res.token) localStorage.setItem('token', res.token);

        // Actualizamos estado global
        this.userData.next({ 
          ...result.user, 
          rol: roleNormalized,
          dbData: res // Contiene el objeto Persona (cedula, nombre, telefono, etc.)
        });

        return res;
      }
      return null;
    } catch (error) {
      console.error("Error en el flujo de Login Social:", error);
      // Si falla la sincronización con Java, cerramos Firebase por seguridad
      await signOut(this.auth);
      throw error;
    }
  }

  /**
   * LOGIN TRADICIONAL
   * Para usuarios que ingresan con correo y contraseña manual.
   */
  async loginWithJava(user: User): Promise<LoginResponse> {
    return firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, user).pipe(
        tap(res => {
          if (res.token) {
            const role = res.rol.toLowerCase();
            localStorage.setItem('token', res.token);
            localStorage.setItem('rol', role);
            this.userData.next({ ...res, rol: role });
          }
        })
      )
    );
  }

  /**
   * LOGOUT
   * Limpia Firebase y el almacenamiento local de la aplicación.
   */
  async logout() {
    try {
      await signOut(this.auth);
      this.zone.run(() => {
        localStorage.clear();
        this.userData.next(null);
        this.router.navigate(['/login'], { replaceUrl: true });
      });
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  }
}