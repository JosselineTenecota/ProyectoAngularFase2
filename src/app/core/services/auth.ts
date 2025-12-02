import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  private userData = new BehaviorSubject<any>(null);
  userData$ = this.userData.asObservable();

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    const firebaseUser = result.user;

    const userRef = doc(this.firestore, `users/${firebaseUser.uid}`);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        role: 'programador', // 👈 asigna un rol por defecto
        createdAt: new Date()
      });
    }

    // Volvemos a leer para tener role garantizado
    const updatedSnap = await getDoc(userRef);
    this.userData.next(updatedSnap.data());
  }

  logout() {
    return this.auth.signOut();
  }
}
