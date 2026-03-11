import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth';
import { Dashboard } from './dashboard/dashboard';
import { AddExpenseComponent } from './add-expense/add-expense';
import { authGuard } from './auth-guard'; // 1. IMPORT YOUR NEW GUARD!

export const routes: Routes = [
  // Public Route (Anyone can see this)
  { path: 'login', component: AuthComponent },

  // Protected Routes (Secured by authGuard)
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard] // THE LOCK 🔒
  },
  {
    path: 'add-expense',
    component: AddExpenseComponent,
    canActivate: [authGuard] // THE LOCK 🔒
  },
  {
    path: 'edit-expense/:id',
    component: AddExpenseComponent,
    canActivate: [authGuard] // THE LOCK 🔒
  },

  // Fallbacks
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' } // Catch-all wildcard
];