import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { AddExpense } from './add-expense/add-expense';

export const routes: Routes = [
  // When the URL is exactly empty (e.g., localhost:4200/), load Dashboard
  { path: '', component: Dashboard, pathMatch: 'full' },

  // When the URL is localhost:4200/add, load AddExpense
  { path: 'add', component: AddExpense },

  // Wildcard route: If the user types a random URL, send them back to Dashboard
  { path: '**', redirectTo: '' }
];