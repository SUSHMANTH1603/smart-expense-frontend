import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ExpenseService } from '../../core/services/expense';
import { CurrencyPipe, DatePipe, KeyValuePipe } from '@angular/common'; // Added KeyValuePipe for grouping
import { ExpenseCardComponent } from '../../shared/components/expense-card/expense-card';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CategoryColorDirective } from '../../directives/category-color';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // Make sure KeyValuePipe is imported here!
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, CategoryColorDirective, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  expenseService = inject(ExpenseService);
  searchControl = new FormControl('');
  searchQuery = signal('');

  // 1. THE ANIMATION STATE: Tracks which items are currently exploding
  deletingIds = signal<Set<string>>(new Set());

  // 2. THE FILTER STATE: Keeps your exact search logic
  filteredExpenses = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const allExpenses = this.expenseService.expenses();
    if (!query) return allExpenses;
    return allExpenses.filter(exp =>
      exp.title.toLowerCase().includes(query) ||
      exp.category.toLowerCase().includes(query)
    );
  });

  // 3. THE DATE GROUPING STATE (NEW!): Automatically groups the filtered list by Date
  // THE UPGRADED DATE GROUPING STATE
  groupedExpenses = computed(() => {
    const list = this.filteredExpenses();

    // 1. Sort into buckets
    const grouped = list.reduce((accumulator, currentExpense) => {
      const dateKey = new Date(currentExpense.date).toDateString();
      if (!accumulator[dateKey]) {
        accumulator[dateKey] = [];
      }
      accumulator[dateKey].push(currentExpense);
      return accumulator;
    }, {} as Record<string, any[]>);

    // 2. Map into an array AND calculate the daily total
    return Object.keys(grouped).map(date => {
      const dailyList = grouped[date];

      // THE NEW MATH: Add up all amounts for this specific day
      const dailyTotal = dailyList.reduce((sum, exp) => sum + exp.amount, 0);

      return {
        dateString: date,
        totalForDay: dailyTotal, // Send the total to the HTML!
        expenses: dailyList
      };
    }).sort((a, b) => new Date(b.dateString).getTime() - new Date(a.dateString).getTime());
  });

  ngOnInit() {
    this.expenseService.fetchExpenses();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchQuery.set(value || '');
    });
  }

  // 4. THE SHATTER ANIMATION LOGIC (NEW!)
  // THE SHATTER ANIMATION LOGIC (FIXED)
  onExpenseDeleted(id: string) {
    // 1. Add this ID to the exploding list (triggers the CSS class)
    const currentSet = new Set(this.deletingIds());
    currentSet.add(id);
    this.deletingIds.set(currentSet);

    // 2. Wait exactly 600ms for the particle CSS animation to finish
    setTimeout(() => {
      // 3. Tell the backend to delete it (No .subscribe needed here!)
      this.expenseService.deleteExpense(id);

      // 4. Cleanup the ID from the animation state
      setTimeout(() => {
        const updatedSet = new Set(this.deletingIds());
        updatedSet.delete(id);
        this.deletingIds.set(updatedSet);
      }, 3000);

    }, 500);
  }
}