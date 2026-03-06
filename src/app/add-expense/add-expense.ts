import { Component, inject } from '@angular/core';
// 1. Import the tools needed for Reactive Forms
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ExpenseService } from '../services/expense';
// 2. Import the Router so we can navigate back to the dashboard after saving
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  // 3. Add ReactiveFormsModule to the imports array!
  imports: [ReactiveFormsModule],
  templateUrl: './add-expense.html',
  styleUrl: './add-expense.css'
})
export class AddExpense {
  

  // Injecting our dependencies
  expenseService = inject(ExpenseService);
  router = inject(Router);

  // 4. Define the FormGroup and its FormControls
  expenseForm = new FormGroup({
    // Initial value is '', and it is strictly required
    title: new FormControl('', Validators.required),

    // Initial value is null, required, and must be at least 1
    amount: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),

    // Defaulting the dropdown to 'Food'
    category: new FormControl('Food', Validators.required)
  });

  // 5. The Submit Action
  onSubmit() {
    // Double-check if the form is valid before processing
    if (this.expenseForm.valid) {

      // We know the form is valid, so we safely extract the values
      const newExpenseData = {
        title: this.expenseForm.value.title!,
        amount: Number(this.expenseForm.value.amount),
        category: this.expenseForm.value.category!
      };

      // Send the data to our centralized vault
      this.expenseService.addExpense(newExpenseData);

      // Navigate the user back to the Dashboard
      this.router.navigate(['/']);
    }
  }
  
}
