import { Injectable, signal, computed, inject } from '@angular/core';
// 1. Import HttpClient
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string | Date; // The server will send the date back as an ISO string
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  // 2. Inject the HttpClient tool
  private http = inject(HttpClient);

  // 3. Define the URL to our Express server
  private apiUrl = `${environment.apiUrl}/expenses`;
  //private apiUrl = 'http://localhost:3000/api/expenses';
  private expensesSignal = signal<Expense[]>([]);
  expenses = this.expensesSignal.asReadonly();

  // NEW: Signal to hold the aggregated chart data from MongoDB
  private statsSignal = signal<{ _id: string, totalSpent: number }[]>([]);
  stats = this.statsSignal.asReadonly();

  totalSpent = computed(() => {
    return this.expensesSignal().reduce((sum, item) => sum + item.amount, 0);
  });

  constructor() {
    // When the service starts, fetch the data from the server
    this.fetchExpenses();
  }

  // --- THE CRUD OPERATIONS ---

  // READ: GET data from Node.js
  fetchExpenses() {
    // We make the GET request, and then .subscribe() to turn on the faucet.
    // When the data arrives, we update our Signal.
    this.http.get<Expense[]>(this.apiUrl).subscribe(data => {
      this.expensesSignal.set(data);
    });
  }

  // READ: Fetch Aggregated Stats
  fetchStats() {
    this.http.get<{ _id: string, totalSpent: number }[]>(`${this.apiUrl}/stats`).subscribe(data => {
      this.statsSignal.set(data);
    });
  }

  // CREATE: POST data to Node.js
  addExpense(expenseData: Omit<Expense, 'id' | 'date'>) {
    this.http.post<Expense>(this.apiUrl, expenseData).subscribe(newExpenseFromServer => {
      // THE SDE FIX: Put the 'newExpenseFromServer' FIRST in the array, 
      // then spread the rest of the 'current' items after it!
      this.expensesSignal.update(current => [newExpenseFromServer, ...current]);

      // (Optional: If you added this earlier, keep it so the chart updates instantly too!)
      this.fetchStats();
    });
  }

  // DELETE: Send DELETE request to Node.js
  deleteExpense(id: string) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      // Once the server confirms it deleted the row, we remove it from our Signal
      this.expensesSignal.update(current => current.filter(expense => expense.id !== id));
      this.fetchStats();
    });
  }

  // UPDATE: Send PUT request to Node.js
  updateExpense(id: string, updatedData: Omit<Expense, 'id' | 'date'>) {
    this.http.put<Expense>(`${this.apiUrl}/${id}`, updatedData).subscribe(updatedExpenseFromServer => {

      // THE SDE FIX: We map through the current array. If the ID matches, we swap in the 
      // fresh data from the server. If not, we leave the old expense exactly as it is.
      this.expensesSignal.update(current =>
        current.map(expense => expense.id === id ? updatedExpenseFromServer : expense)
      );

      this.fetchStats(); // Instantly recalculate the chart!
    });
  }


}
