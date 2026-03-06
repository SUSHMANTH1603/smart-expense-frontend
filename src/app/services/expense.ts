import { Injectable, signal, computed, inject } from '@angular/core';
// 1. Import HttpClient
import { HttpClient } from '@angular/common/http';

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
  private apiUrl = 'https://expense-backend-6b8n.onrender.com/api/expenses';

  private expensesSignal = signal<Expense[]>([]);
  expenses = this.expensesSignal.asReadonly();

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

  // CREATE: POST data to Node.js
  addExpense(expenseData: Omit<Expense, 'id' | 'date'>) {
    this.http.post<Expense>(this.apiUrl, expenseData).subscribe(newExpenseFromServer => {
      // Once the server confirms it saved the data and sends it back with an ID, 
      // we add it to our frontend Signal to update the UI instantly.
      this.expensesSignal.update(current => [...current, newExpenseFromServer]);
    });
  }

  // DELETE: Send DELETE request to Node.js
  deleteExpense(id: string) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      // Once the server confirms it deleted the row, we remove it from our Signal
      this.expensesSignal.update(current => current.filter(expense => expense.id !== id));
    });
  }
}