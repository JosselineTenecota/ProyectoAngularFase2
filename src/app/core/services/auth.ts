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

  // ✅ Backend Java Auth
  private apiUrl = `${environment.apiUrl}/auth`;

  private userData = new BehaviorSubject<any>(null);
  userData$ = this.userData.asObservable();

  public currentRole: string = '';

  constructor() {

    const storedUser = this.currentUser;
    if (storedUser) {
      this.currentRole = storedUser.rol?.toLowerCase() || '';
      this.userData.next(storedUser);
    }

    onAuthStateChanged(this.auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        if (!this.currentUser) {
          this.sincronizarConJava(firebaseUser.email, firebaseUser.displayName);
        }
      } else {
        this.userData.next(null);
        localStorage.removeItem('user');
        localStorage.removeItem('rol');
        localStorage.removeItem('token');
      }
    });
  }

  // ✅ Obtener usuario desde localStorage
  get currentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // ✅ Login con Google
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);

      const res = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/login-social`, {
          correo: result.user.email,
          nombre: result.user.displayName
        })
      );

      if (res) {
        this.establecerSesion(res);
        return res;
      }

      return null;

    } catch (error) {
      console.error("Error en Login Social:", error);
      await signOut(this.auth);
      throw error;
    }
  }

  // ✅ Login normal Java
  async loginWithJava(user: User): Promise<LoginResponse> {
    return firstValueFrom(
      this.http.post<LoginResponse>(`${this.apiUrl}/login`, user).pipe(
        tap(res => {
          if (res) this.establecerSesion(res);
        })
      )
    );
  }

  // ✅ Sincronización automática con backend
  private async sincronizarConJava(correo: string | null, nombre: string | null) {
    if (!correo) return;

    try {
      const res = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/login-social`, { correo, nombre })
      );

      if (res) this.establecerSesion(res);

    } catch (e) {
      console.error("Error sincronizando:", e);
    }
  }

  // ✅ Guardar sesión correctamente
  private establecerSesion(res: any) {

    const roleNormalized = res.rol ? res.rol.toLowerCase() : 'programador';

    const userFinal = {
      ...res,
      rol: roleNormalized,
      cedula: res.persona?.cedula || res.cedula || res.per_cedula_fk
    };

    localStorage.setItem('user', JSON.stringify(userFinal));
    localStorage.setItem('rol', roleNormalized);

    if (res.token) {
      localStorage.setItem('token', res.token);
    }

    this.currentRole = roleNormalized;
    this.userData.next(userFinal);
  }

  // ✅ Logout limpio
  async logout() {
    try {
      await signOut(this.auth);

      this.zone.run(() => {
        localStorage.clear();
        this.currentRole = '';
        this.userData.next(null);
        this.router.navigate(['/login'], { replaceUrl: true });
      });

    } catch (error) {
      console.error('Error logout:', error);
    }
  }
}
