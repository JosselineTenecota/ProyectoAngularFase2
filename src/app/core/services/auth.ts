import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private auth = inject(Auth);
  private firestore = inject(Firestore);

  private userData = new BehaviorSubject<any>(null);
  userData$ = this.userData.asObservable();

  constructor() {
    // 👇 Esto mantiene la sesión aunque recargues la página
    onAuthStateChanged(this.auth, async (firebaseUser) => {

      if (!firebaseUser) {
        this.userData.next(null);
        return;
      }

      const userRef = doc(this.firestore, `users/${firebaseUser.uid}`);
      const snap = await getDoc(userRef);

      // Si el usuario no existe en Firestore, lo creamos
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photo: firebaseUser.photoURL,
          role: 'programador',
          createdAt: new Date()
        });
      }

      // Obtenemos datos actualizados
      const updated = await getDoc(userRef);
      this.userData.next(updated.data());
    });
  }

  // 🔵 LOGIN CON GOOGLE
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }

  // 🔴 LOGOUT 100% funcional
  async logout() {
    await signOut(this.auth);
    this.userData.next(null); // 🔥 Actualiza el navbar inmediatamente
  }
}
