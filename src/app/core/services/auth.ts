import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from '@angular/fire/auth';

import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private auth = inject(Auth);
  private firestore = inject(Firestore);

  private userData = new BehaviorSubject<any>(null);
  userData$ = this.userData.asObservable();

  // NUEVAS VARIABLES
  currentUser: any = null;
  currentRole: string | null = null;

  constructor() {

    // Mantener sesión incluso tras recargar
    onAuthStateChanged(this.auth, async (firebaseUser) => {

      if (!firebaseUser) {
        this.userData.next(null);
        this.currentUser = null;
        this.currentRole = null;
        return;
      }

      const userRef = doc(this.firestore, `users/${firebaseUser.uid}`);
      const snap = await getDoc(userRef);

      // Si NO existe en Firestore → CREARLO
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Usuario',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || null,
          role: 'usuario',
          createdAt: new Date()
        });
      }

      // Obtener datos actualizados
      const updated = await getDoc(userRef);
      const data = updated.data();

      this.currentUser = data;
      this.currentRole = data?.['role'] ?? null;

      this.userData.next(data);
    });
  }

  // -------------------------
  // LOGIN CON GOOGLE
  // -------------------------
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }

  // -------------------------
  // LOGIN CON EMAIL
  // -------------------------
  async loginWithEmail(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);

    const userRef = doc(this.firestore, `users/${cred.user.uid}`);
    const snap = await getDoc(userRef);

    // Si no existe en Firestore (raro) → lo creamos
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: cred.user.uid,
        name: cred.user.email?.split('@')[0] || 'Usuario',
        email: cred.user.email,
        photoURL: null,
        role: 'usuario',
        createdAt: new Date()
      });
    }

    const updated = await getDoc(userRef);
    const data = updated.data();

    this.currentUser = data;
    this.currentRole = data?.['role'] ?? null;

    this.userData.next(data);

    return data;
  }

  // -------------------------
  // REGISTRO CON EMAIL
  // -------------------------
  async registerWithEmail(email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);

    const userRef = doc(this.firestore, `users/${cred.user.uid}`);

    await setDoc(userRef, {
      uid: cred.user.uid,
      name: email.split('@')[0],
      email,
      photoURL: null,
      role: 'usuario',
      createdAt: new Date()
    });

    const data = (await getDoc(userRef)).data();

    this.currentUser = data;
    this.currentRole = data?.['role'] ?? null;

    this.userData.next(data);

    return data;
  }

  // -------------------------
  // LOGOUT (CORREGIDO)
  //–-------------------------
  async logout() {
    try {
      await signOut(this.auth);

      // Limpia estado local
      this.userData.next(null);
      this.currentUser = null;
      this.currentRole = null;
      localStorage.clear();

      // Navegación segura
      const router = inject(Router);
      router.navigate(['/login'], { replaceUrl: true });

    } catch (error) {
      console.error('Error en logout:', error);
    }
  }

}
