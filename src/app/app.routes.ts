import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { programadorGuard } from './core/guards/programador-guard';
import { Solicitar } from './asesorias/solicitar/solicitar';

export const routes: Routes = [
  // --- RUTAS PÚBLICAS ---
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
    path: 'portafolios',
    loadComponent: () =>
      import('./public/pages/programadores/programadores').then(m => m.Programadores),
  },
  {
    path: 'portafolio/:id',
    loadComponent: () =>
      import('./public/pages/portafolio/portafolio').then(m => m.Portafolio),
  },
  {
    path: 'agendar',
    loadComponent: () => 
      // OJO: Aquí apuntamos al archivo con nombre largo (.component)
      import('./asesorias/agendar/agendar.component').then(m => m.AgendarComponent),
  },

  // --- RUTAS PROTEGIDAS ---
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
  path: 'programador/solicitudes',
  component: Solicitar
  },


  // --- COMODÍN (SIEMPRE AL FINAL) ---
  { path: '**', redirectTo: '' },
];