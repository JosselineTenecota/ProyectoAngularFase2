import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs/operators';

export const programadorGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Intento rápido con localStorage
  const localRol = typeof localStorage !== 'undefined' ? localStorage.getItem('rol') : null;
  if (localRol && (localRol.toLowerCase() === 'programador' || localRol.toLowerCase() === 'usuario')) {
    return true;
  }

  // 2. Validación con el flujo de datos del servicio
  return authService.userData$.pipe(
    take(1),
    map(user => {
      // Importante: Usar 'rol' y no 'role'
      const userRol = user?.rol?.toLowerCase();

      if (userRol === 'programador' || userRol === 'usuario' || userRol === 'cliente') {
        return true;
      }

      console.error('ProgramadorGuard: Acceso denegado');
      router.navigate(['/']);
      return false;
    })
  );
};