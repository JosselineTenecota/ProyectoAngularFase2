import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginResponse, User } from '../models/user';
import { firstValueFrom, tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { NgZone } from '@angular/core';

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

  private apiUrl = `${environment.apiUrl}/usuarios`; // Apuntamos a la ruta de usuarios

  private userData = new BehaviorSubject<any>(null);
  userData$ = this.userData.asObservable();

  // ... dentro de la clase AuthService ...

  get currentUser() {
    return this.userData.value;
  }

  // REAGREGA ESTO PARA QUITAR EL ERROR DEL NAVBAR
  get currentRole(): string | null {
    const user = this.userData.value;
    if (!user) return null;

    // Retorna el rol en minúsculas para que las comparaciones del HTML no fallen
    const r = user.rol || '';
    return r.toLowerCase();
  }

  // ... resto del código ...

  constructor() {
    // Restaurar sesión al recargar
    onAuthStateChanged(this.auth, (firebaseUser: FirebaseUser | null) => {
      const javaToken = localStorage.getItem('token');
      const javaRol = localStorage.getItem('rol');

      if (javaRol) {
        // Si hay un rol guardado (ya sea de Java o Social), lo restauramos
        this.userData.next({
          ...(firebaseUser || {}),
          rol: javaRol,
          token: javaToken
        });
      } else if (firebaseUser) {
        this.userData.next(firebaseUser);
      } else {
        this.userData.next(null);
      }
    });
  }

  // --- LOGIN GOOGLE + SINCRONIZACIÓN JAVA ---
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const email = result.user.email;

      console.log("Verificando usuario en Java:", email);

      // En auth.ts, dentro de loginWithGoogle
      // En auth.ts, dentro de loginWithGoogle()
      // En auth.ts, dentro de loginWithGoogle
      try {
        const res = await firstValueFrom(
          this.http.post<any>(`${this.apiUrl}/login-social`, { correo: email })
        );

        console.log('Respuesta del servidor:', res);

        if (res && res.rol) {
          // 1. Guardamos el rol en minúsculas para evitar fallos de comparación
          const role = res.rol.toLowerCase();
          localStorage.setItem('rol', role);

          // 2. Actualizamos el BehaviorSubject con los datos del usuario + el rol de la DB
          this.userData.next({ ...result.user, rol: role });

          // 3. Devolvemos el objeto para que el componente Login sepa que terminó bien
          return res;
        }
      } catch (error) {
        console.error('Error en el flujo de login:', error);
        throw error; // Es importante lanzar el error para que el componente lo detecte
      }

    } catch (error) {
      console.error("Error popup Google:", error);
      return null;
    }
  }

  // --- LOGIN TRADICIONAL ---
  async loginWithJava(user: User): Promise<LoginResponse> {
    // Ajusta la URL si tu login normal está en /auth/login o /usuarios/login
    return firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, user).pipe(
        tap(res => {
          if (res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('rol', res.rol);
            this.userData.next({ ...res, rol: res.rol });
          }
        })
      )
    );
  }

  async logout() {
    try {
      // Envolvemos esto en zone.run para que Angular no se queje
      await signOut(this.auth);
      this.zone.run(() => {
        localStorage.clear();
        this.userData.next(null);
        this.router.navigate(['/login'], { replaceUrl: true });
      });
    } catch (error) {
      console.error('Error logout', error);
    }
  }
}