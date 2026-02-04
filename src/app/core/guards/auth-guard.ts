import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificación rápida por Token o Rol en localStorage
  if (typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');

    // Si tenemos evidencia de sesión local, permitimos el paso inicial
    if (token || rol) {
      return true;
    }
  }

  // 2. Verificación por estado de Firebase/AuthService
  return authService.userData$.pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      }

      console.warn('AuthGuard: Usuario no autenticado, redirigiendo a login');
      router.navigate(['/login']);
      return false;
    })
  );
};