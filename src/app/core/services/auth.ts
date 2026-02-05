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

  private userData = new BehaviorSubject<any>(null);
  userData$ = this.userData.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDataStored = localStorage.getItem('user_db');
        if (userDataStored) {
          const userObj = JSON.parse(userDataStored);
          this.userData.next(userObj);
          localStorage.setItem('user', userDataStored); // Sincronización para getters
        } else {
          this.sincronizarConJava(firebaseUser.email, firebaseUser.displayName);
        }
      } else {
        this.userData.next(null);
        localStorage.clear();
      }
    });
  }

  // ... (Tus otros métodos se mantienen igual)

  private async sincronizarConJava(correo: string | null, nombre: string | null) {
    try {
      const res = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/login-social`, { correo, nombre })
      );
      if (res) {
        // Normalizamos el rol a minúsculas para que los Guards no fallen
        const userFinal = { ...res, rol: res.rol.toLowerCase() };

        // --- AQUÍ ESTÁ EL ARREGLO ---
        localStorage.setItem('rol', userFinal.rol);
        localStorage.setItem('user_db', JSON.stringify(userFinal)); // La que usas tú
        localStorage.setItem('user', JSON.stringify(userFinal));    // La que usa el Dashboard

        this.userData.next(userFinal);
        console.log("Sesión sincronizada con Postgres correctamente.");
      }
    } catch (e) {
      console.error("Error: Java no reconoce este usuario", e);
      this.logout();
    }
  }

  // Asegúrate de que este getter sea así para que el Dashboard no falle
  get currentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  get currentRole(): string | null {
    const user = this.userData.value;
    return user ? (user.rol || '').toLowerCase() : null;
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);

      const payload = {
        correo: result.user.email,
        nombre: result.user.displayName || 'Usuario de Google'
      };

      const res = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/login-social`, payload)
      );

      if (res && res.rol) {
        const roleNormalized = res.rol.toLowerCase();
        localStorage.setItem('rol', roleNormalized);
        if (res.token) localStorage.setItem('token', res.token);

        const sessionData = {
          ...res, // Datos de Postgres (cedula, nombre, etc)
          rol: roleNormalized,
          firebaseData: result.user
        };

        localStorage.setItem('user_db', JSON.stringify(sessionData));
        localStorage.setItem('user', JSON.stringify(sessionData));
        this.userData.next(sessionData);

        return res;
      }
      return null;
    } catch (error) {
      console.error("Error en el flujo de Login Social:", error);
      await signOut(this.auth);
      throw error;
    }
  }

  async loginWithJava(user: User): Promise<LoginResponse> {
    return firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, user).pipe(
        tap(res => {
          if (res.token) {
            const role = res.rol.toLowerCase();
            localStorage.setItem('token', res.token);
            localStorage.setItem('rol', role);
            localStorage.setItem('user', JSON.stringify(res));
            this.userData.next({ ...res, rol: role });
          }
        })
      )
    );
  }

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