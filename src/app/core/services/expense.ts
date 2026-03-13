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

  // SDE FIX 1: Calculate the chart data LOCALLY in memory. 
  // Zero network calls = zero lag and zero chart jitter.
  stats = computed(() => {
    const categoryTotals: { [key: string]: number } = {};

    // Group the current expenses by category instantly
    this.expensesSignal().forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    });

    // Format it perfectly for your bar graph
    return Object.keys(categoryTotals).map(key => ({
      _id: key,
      totalSpent: categoryTotals[key]
    }));
  });

  totalSpent = computed(() => {
    return this.expensesSignal().reduce((sum, item) => sum + item.amount, 0);
  });

  constructor() {
    this.fetchExpenses();
  }

  // We only fetch from the database once when the app loads!
  fetchExpenses() {
    this.http.get<Expense[]>(this.apiUrl).subscribe(data => {
      this.expensesSignal.set(data);
    });
  }

  addExpense(expenseData: Omit<Expense, 'id' | 'date'>) {
    this.http.post<Expense>(this.apiUrl, expenseData).subscribe(newExpense => {
      this.expensesSignal.update(current => {
        // SDE FIX 2: The Duplicate Blocker. 
        // If Angular accidentally tries to add it twice, we block it.
        const alreadyExists = current.find(e => e.id === newExpense.id);
        if (alreadyExists) return current;

        return [newExpense, ...current];
      });
    });
  }

  deleteExpense(id: string) {
    // Instant UI removal. The computed stats chart will also update instantly!
    this.expensesSignal.update(current => current.filter(expense => expense.id !== id));

    // Delete from the backend silently in the background
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      error: () => this.fetchExpenses() // Only re-fetch if the server crashes
    });
  }

  updateExpense(id: string, updatedData: Omit<Expense, 'id' | 'date'>) {
    this.http.put<Expense>(`${this.apiUrl}/${id}`, updatedData).subscribe(updatedExpense => {
      this.expensesSignal.update(current =>
        current.map(expense => expense.id === id ? updatedExpense : expense)
      );
    });
  }
}