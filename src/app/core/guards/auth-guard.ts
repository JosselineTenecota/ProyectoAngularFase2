import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.userData$.pipe(
    take(1),
    map(user => {
      // 1. Verificar si el usuario existe (autenticado por Google y validado en Java)
      if (!user) {
        console.warn('Acceso denegado: No hay sesión activa.');
        router.navigate(['/login']);
        return false;
      }

      // 2. Obtener el rol que viene desde tu base de datos PostgreSQL (vía Java)
      // Lo convertimos a Mayúsculas para evitar errores de comparación
      const userRoleFromDB = user.rol ? user.rol.toUpperCase() : null;

      // 3. Verificar si la ruta requiere un rol específico (definido en app.routes.ts)
      const expectedRole = route.data['role'] ? route.data['role'].toUpperCase() : null;

      if (expectedRole) {
        if (userRoleFromDB === expectedRole) {
          return true; // El rol coincide con la base de datos
        } else {
          console.error(`Permisos insuficientes. Se requiere: ${expectedRole}, pero tienes: ${userRoleFromDB}`);
          
          // Redirección inteligente según el rol que sí tenga
          if (userRoleFromDB === 'ADMIN') router.navigate(['/admin']);
          else if (userRoleFromDB === 'PROGRAMADOR') router.navigate(['/programador']);
          else router.navigate(['/']); // Cliente o desconocido va al home
          
          return false;
        }
      }

      // 4. Si la ruta no pide un rol específico, con estar logueado basta
      return true;
    })
  );
};