import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth';
import { authGuard } from './auth-guard';

// Notice we REMOVED the static imports for Dashboard and AddExpense at the top!

export const routes: Routes = [
  // The Login page is loaded immediately (eager loading) because it's the front door
  { path: 'login', component: AuthComponent },

  // The Dashboard is LAZY LOADED. It is only fetched from the server IF the user passes the guard.
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },

  // The Add/Edit pages are also LAZY LOADED.
  {
    path: 'add-expense',
    loadComponent: () => import('./add-expense/add-expense').then(m => m.AddExpenseComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit-expense/:id',
    loadComponent: () => import('./add-expense/add-expense').then(m => m.AddExpenseComponent),
    canActivate: [authGuard]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];