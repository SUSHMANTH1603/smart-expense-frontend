import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string | Date;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/expenses`;

  private expensesSignal = signal<Expense[]>([]);
  expenses = this.expensesSignal.asReadonly();

  // This perfectly matches the aggregation pipeline we just built in the backend
  private statsSignal = signal<{ _id: string, totalSpent: number }[]>([]);
  stats = this.statsSignal.asReadonly();

  totalSpent = computed(() => {
    return this.expensesSignal().reduce((sum, item) => sum + item.amount, 0);
  });

  constructor() {
    this.fetchExpenses();
  }

  fetchExpenses() {
    this.http.get<Expense[]>(this.apiUrl).subscribe(data => {
      this.expensesSignal.set(data);
      this.fetchStats();
    });
  }

  fetchStats() {
    this.http.get<{ _id: string, totalSpent: number }[]>(`${this.apiUrl}/stats`).subscribe(data => {
      this.statsSignal.set(data);
    });
  }

  addExpense(expenseData: Omit<Expense, 'id' | 'date'>) {
    this.http.post<Expense>(this.apiUrl, expenseData).subscribe(newExpense => {
      // Backend returns the real ID instantly, so we just add it to the top of the signal!
      this.expensesSignal.update(current => [newExpense, ...current]);
      this.fetchStats(); // Update the bar chart
    });
  }

  deleteExpense(id: string) {
    // 1. Instant UI removal for that lightning-fast feel
    this.expensesSignal.update(current => current.filter(expense => expense.id !== id));

    // 2. Background deletion
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.fetchStats(), // Update the bar chart
      error: () => this.fetchExpenses() // If server fails, refresh data to put it back
    });
  }

  updateExpense(id: string, updatedData: Omit<Expense, 'id' | 'date'>) {
    this.http.put<Expense>(`${this.apiUrl}/${id}`, updatedData).subscribe(updatedExpense => {
      this.expensesSignal.update(current =>
        current.map(expense => expense.id === id ? updatedExpense : expense)
      );
      this.fetchStats();
    });
  }
}