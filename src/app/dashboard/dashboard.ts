import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ExpenseService } from '../services/expense';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ExpenseCardComponent } from '../expense-card/expense-card';
// 1. Import Forms and RxJS Operators
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CategoryColorDirective } from '../directives/category-color';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // 2. Add ReactiveFormsModule to your imports array!
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, CategoryColorDirective, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  expenseService = inject(ExpenseService);

  // 3. The Search Input Control
  searchControl = new FormControl('');

  // 4. A Signal to hold the current typed text
  searchQuery = signal('');

  // 5. The Magic: A Computed Signal! 
  // This automatically runs the exact millisecond 'searchQuery' or 'expenses' change.
  filteredExpenses = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const allExpenses = this.expenseService.expenses();

    // If the search bar is empty, show everything
    if (!query) return allExpenses;

    // Otherwise, filter by title OR category
    return allExpenses.filter(exp =>
      exp.title.toLowerCase().includes(query) ||
      exp.category.toLowerCase().includes(query)
    );
  });

  ngOnInit() {
    this.expenseService.fetchExpenses();
    this.expenseService.fetchStats(); // Fetch the chart data!

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchQuery.set(value || '');
    });
  }

  onExpenseDeleted(id: string) {
    this.expenseService.deleteExpense(id);
  }
}