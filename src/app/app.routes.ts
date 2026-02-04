import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { programadorGuard } from './core/guards/programador-guard';

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
      import('./asesorias/agendar/agendar.component').then(m => m.AgendarComponent),
  },

  // --- RUTAS PROTEGIDAS (ADMIN) ---
  {
    path: 'admin',
    // Si la redirección falla, comenta canActivate temporalmente para probar
    canActivate: [authGuard, adminGuard], 
    loadComponent: () =>
      import('./admin/admin-dashboard/admin-dashboard')
        .then(m => m.AdminDashboard),
  },

  // --- RUTAS PROTEGIDAS (PROGRAMADOR) ---
  {
    path: 'programador',
    canActivate: [authGuard, programadorGuard],
    children: [
      {
        path: '', // Esta es la ruta /programador
        loadComponent: () => import('./programador/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'solicitudes', // Esta es la ruta /programador/solicitudes
        loadComponent: () => import('./asesorias/solicitar/solicitar').then(m => m.Solicitar)
      }
    ]
  },

  // --- OTRAS RUTAS DE GESTIÓN ---
  {
    path: 'portafolio/:id/proyectos',
    loadComponent: () =>
      import('./programador/mis-proyectos/mis-proyectos').then(m => m.MisProyectos),
  },
  {
    path: 'mis-asesorias',
    loadComponent: () => import('./asesorias/solicitar/solicitar').then(m => m.Solicitar),
  },

  // --- COMODÍN (SIEMPRE AL FINAL) ---
  { path: '**', redirectTo: '', pathMatch: 'full' },
];