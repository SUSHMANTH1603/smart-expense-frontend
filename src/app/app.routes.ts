import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard'; // 1. IMPORT YOUR NEW GUARD!

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/auth').then(m => m.AuthComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'add-expense',
    loadComponent: () => import('./features/add-expense/add-expense').then(m => m.AddExpenseComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit-expense/:id',
    loadComponent: () => import('./features/add-expense/add-expense').then(m => m.AddExpenseComponent),
    canActivate: [authGuard]
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' } // Catch-all wildcard
];