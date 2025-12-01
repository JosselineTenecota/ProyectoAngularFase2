import { 
  ApplicationConfig, 
  provideBrowserGlobalErrorListeners, 
  provideZoneChangeDetection 
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDuaZ0u_E3PHJ2gfP7Qp55_-IeaBRrKXqA",
  authDomain: "salitenecoportafolio.firebaseapp.com",
  projectId: "salitenecoportafolio",
  storageBucket: "salitenecoportafolio.firebasestorage.app",
  messagingSenderId: "110341634338",
  appId: "1:110341634338:web:f0aebb21a1f361f8b90d7b"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ]
};
