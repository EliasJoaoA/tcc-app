import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./pages/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'videos',
        loadComponent: () => import('./pages/videos/videos.component').then(m => m.VideosComponent),
      },
      {
        path: 'map-points',
        loadComponent: () => import('./pages/map-points/map-points.component').then(m => m.MapPointsComponent),
      },
      {
        path: 'email-templates',
        loadComponent: () => import('./pages/email-templates/email-templates.component').then(m => m.EmailTemplatesComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
