import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators'; // Agregamos 'take'
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. REGLA MAESTRA (FASE 2):
  // Si existe un token en el navegador, el usuario YA inició sesión con Java.
  // Lo dejamos pasar inmediatamente sin esperar nada más.
  if (typeof localStorage !== 'undefined' && localStorage.getItem('token')) {
    return true;
  }

  // 2. REGLA SECUNDARIA (FASE 1 - Firebase):
  // Si no hay token, miramos si hay sesión de Google activa.
  return authService.userData$.pipe(
    take(1), // Importante: Tomar solo 1 valor y cerrar para que el Guard no se quede colgado
    map(user => {
      if (user) {
        return true;
      }
      
      // Si no hay Token ni Usuario Firebase -> Pa' fuera
      router.navigate(['/login']); 
      return false;
    })
  );
};