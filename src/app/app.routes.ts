import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { programadorGuard } from './core/guards/programador-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./public/pages/home/home').then(m => m.Home),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login').then(m => m.Login),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./admin/admin-dashboard/admin-dashboard')
        .then(m => m.AdminDashboard),
  },
  {
    path: 'programador',
    canActivate: [authGuard, programadorGuard],
    loadComponent: () =>
      import('./programador/dashboard/dashboard')
        .then(m => m.Dashboard),
  },

  {
    path: '**',
    redirectTo: '',
  },
];
