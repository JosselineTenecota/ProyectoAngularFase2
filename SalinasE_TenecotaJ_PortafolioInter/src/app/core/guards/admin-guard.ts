import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map } from 'rxjs/operators';

export const adminGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.userData$.pipe(
    map(user => {
      if (user && user.role === 'admin') {
        return true; 
      }

      router.navigate(['/']);
      return false;
    })
  );
};
