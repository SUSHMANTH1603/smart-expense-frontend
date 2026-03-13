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

  // CREATE: Instant UI Update (Optimistic)
  addExpense(expenseData: Omit<Expense, 'id' | 'date'>) {
    // 1. Create a temporary "Fake" expense to show the user instantly
    const optimisticExpense: Expense = {
      ...expenseData,
      id: 'temp-' + Date.now(), // Fake ID
      date: new Date().toISOString()
    };

    // 2. Instantly put it on the screen! Zero lag.
    this.expensesSignal.update(current => [optimisticExpense, ...current]);

    // 3. Send it to the backend silently
    this.http.post<Expense>(this.apiUrl, expenseData).subscribe({
      next: (newExpenseFromServer) => {
        // Once the server saves it, silently swap the fake ID for the real database ID
        this.expensesSignal.update(current =>
          current.map(expense => expense.id === optimisticExpense.id ? newExpenseFromServer : expense)
        );
        this.fetchStats(); // Update chart in background
      },
      error: (err) => {
        // If the server crashes, remove the fake item from the screen
        console.error('Server failed to save expense', err);
        this.expensesSignal.update(current => current.filter(e => e.id !== optimisticExpense.id));
      }
    });
  }

  // DELETE: Instant UI Update (Optimistic)
  deleteExpense(id: string) {
    // 1. Save a backup of the current state just in case
    const previousState = this.expensesSignal();

    // 2. Instantly remove it from the screen! Zero lag.
    this.expensesSignal.update(current => current.filter(expense => expense.id !== id));

    // 3. Tell the backend to delete it silently
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.fetchStats(); // Update chart in background
      },
      error: (err) => {
        // If the server fails to delete it, put it back on the screen!
        console.error('Server failed to delete expense', err);
        this.expensesSignal.set(previousState);
      }
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
