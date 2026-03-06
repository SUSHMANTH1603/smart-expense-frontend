import { Component, inject } from '@angular/core';
import { ExpenseService } from '../services/expense';
// Import Pipes to format our numbers and dates nicely in the HTML
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ExpenseCardComponent } from '../expense-card/expense-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // We must tell this island component it's allowed to use these formatting tools
  imports: [CurrencyPipe, DatePipe, ExpenseCardComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  // Grab the "key" to our centralized data vault
  expenseService = inject(ExpenseService);
  // Add this inside the DashboardComponent class
  onExpenseDeleted(id: string) {
    this.expenseService.deleteExpense(id);
  }
}