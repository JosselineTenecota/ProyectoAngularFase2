import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { onAuthStateChanged } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private auth = inject(Auth);
  private firestore = inject(Firestore);

  private userData = new BehaviorSubject<any>(null);
  userData$ = this.userData.asObservable();

  constructor() {
    // Nueva forma en AngularFire 20
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(this.firestore, `users/${firebaseUser.uid}`);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          this.userData.next(snap.data());
        } else {
          const newUser = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            photo: firebaseUser.photoURL,
            role: 'usuario'
          };
          await setDoc(userRef, newUser);
          this.userData.next(newUser);
        }

      } else {
        this.userData.next(null);
      }
    });
  }

  // LOGIN CON GOOGLE
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(this.auth, provider);
  }

  logout() {
    return signOut(this.auth);
  }

  get currentUser() {
    return this.userData.value;
  }

  get currentRole() {
    return this.userData.value?.role ?? null;
  }

  isLogged(): boolean {
    return !!this.userData.value;
  }
}
