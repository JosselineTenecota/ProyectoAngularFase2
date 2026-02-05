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

  // CORRECCIÓN DE RUTA: En tu Java el @Path es "auth"
  private apiUrl = `${environment.apiUrl}/auth`; 

  private userData = new BehaviorSubject<any>(null);
  userData$ = this.userData.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDataStored = localStorage.getItem('user');
        if (userDataStored) {
          this.userData.next(JSON.parse(userDataStored));
        } else {
          this.sincronizarConJava(firebaseUser.email, firebaseUser.displayName);
        }
      } else {
        this.userData.next(null);
        localStorage.clear();
      }
    });
  }

  /**
   * MÉTODO 1: Login con Google (Firebase + Java)
   * Arregla el error TS2339 en login.ts:42
   */
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);

      const payload = {
        correo: result.user.email,
        nombre: result.user.displayName || 'Usuario de Google'
      };

      // Llamada al endpoint login-social en tu Backend de Java
      const res = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/login-social`, payload)
      );

      if (res && res.rol) {
        this.establecerSesion(res);
        return res;
      }
      return null;
    } catch (error) {
      console.error("Error en el flujo de Login Social:", error);
      await signOut(this.auth);
      throw error;
    }
  }

  /**
   * MÉTODO 2: Login con Credenciales (Java Directo)
   * Arregla el error TS2339 en login.ts:57
   */
  async loginWithJava(user: User): Promise<LoginResponse> {
    return firstValueFrom(
      this.http.post<LoginResponse>(`${this.apiUrl}/login`, user).pipe(
        tap(res => {
          if (res.token) {
            this.establecerSesion(res);
          }
        })
      )
    );
  }

  /**
   * MÉTODO 3: Sincronización automática
   */
  private async sincronizarConJava(correo: string | null, nombre: string | null) {
    if (!correo) return;
    try {
      const res = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/login-social`, { correo, nombre })
      );
      if (res && res.cedula) {
        this.establecerSesion(res);
      }
    } catch (e) {
      console.error("Error sincronizando sesión:", e);
    }
  }

  /**
   * MÉTODO 4: Guardar datos en LocalStorage
   * Asegura que la cédula se guarde para llenar los paréntesis ()
   */
  private establecerSesion(res: any) {
    const roleNormalized = res.rol ? res.rol.toLowerCase() : 'programador';
    const userFinal = { ...res, rol: roleNormalized };

    localStorage.setItem('rol', roleNormalized);
    localStorage.setItem('user', JSON.stringify(userFinal)); 
    if (res.token) localStorage.setItem('token', res.token);

    this.userData.next(userFinal);
  }

  get currentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
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