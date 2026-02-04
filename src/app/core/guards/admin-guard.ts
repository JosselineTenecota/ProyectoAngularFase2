import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs/operators';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificamos primero el localStorage para una respuesta instantánea
  const localRol = localStorage.getItem('rol');
  
  // Validamos el rol (usamos toLowerCase para que no importe si es ADMIN o admin)
  if (localRol && localRol.toLowerCase() === 'admin') {
    return true;
  }

  // 2. Si no está en el local, verificamos el estado del Observable
  return authService.userData$.pipe(
    take(1), // Importante para que el Guard se complete
    map(user => {
      // Usamos 'rol' que es como viene de tu Java según la consola
      if (user && user.rol && user.rol.toLowerCase() === 'admin') {
        return true;
      }

      console.warn('Acceso denegado: El usuario no es admin');
      router.navigate(['/login']);
      return false;
    })
  );
};