import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // --- RUTAS PÚBLICAS ---
  {
    path: '',
    loadComponent: () => import('./public/pages/home/home').then(m => m.Home),
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.Login),
  },
  {
    path: 'portafolios',
    loadComponent: () => import('./public/pages/programadores/programadores').then(m => m.Programadores),
  },
  {
    path: 'portafolio/:id',
    loadComponent: () => import('./public/pages/portafolio/portafolio').then(m => m.Portafolio),
  },

  // --- RUTAS PROTEGIDAS (ADMIN) ---
  {
    path: 'admin',
    canActivate: [authGuard], 
    data: { role: 'ADMIN' }, // El guard verificará que Java devolvió 'ADMIN'
    loadComponent: () => import('./admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
  },

  // --- RUTAS PROTEGIDAS (PROGRAMADOR) ---
  {
    path: 'programador',
    canActivate: [authGuard],
    data: { role: 'PROGRAMADOR' }, // El guard verificará que Java devolvió 'PROGRAMADOR'
    children: [
      {
        path: '',
        loadComponent: () => import('./programador/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'solicitudes',
        loadComponent: () => import('./asesorias/solicitar/solicitar').then(m => m.Solicitar)
      }
    ]
  },

  // --- RUTAS DE GESTIÓN (CLIENTE / MIXTO) ---
  {
    path: 'agendar',
    canActivate: [authGuard],
    loadComponent: () => import('./asesorias/agendar/agendar.component').then(m => m.AgendarComponent),
  },
  {
    path: 'mis-asesorias',
    canActivate: [authGuard],
    loadComponent: () => import('./asesorias/solicitar/solicitar').then(m => m.Solicitar),
  },
  {
    path: 'portafolio/:id/proyectos',
    canActivate: [authGuard],
    loadComponent: () => import('./programador/mis-proyectos/mis-proyectos').then(m => m.MisProyectos),
  },

  // --- COMODÍN ---
  { path: '**', redirectTo: '', pathMatch: 'full' },
];