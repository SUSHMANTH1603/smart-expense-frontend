import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; // Add ActivatedRoute
import { ExpenseService } from '../services/expense'; // or expense.service

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-expense.html',
  styleUrl: './add-expense.css'
})
export class AddExpenseComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute); // The tool to read the URL

  editId: string | null = null; // Keeps track of whether we are editing or adding

  expenseForm = new FormGroup({
    title: new FormControl('', Validators.required),
    amount: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    category: new FormControl('', Validators.required)
  });

  ngOnInit() {
    // When the page loads, check if there is an ':id' in the URL
    this.editId = this.route.snapshot.paramMap.get('id');

    if (this.editId) {
      // We are in Edit Mode! Let's find the existing expense in our Signal
      const existingExpense = this.expenseService.expenses().find(e => e.id === this.editId);

      if (existingExpense) {
        // patchValue automatically types the old data into the form inputs!
        this.expenseForm.patchValue({
          title: existingExpense.title,
          amount: existingExpense.amount,
          category: existingExpense.category
        });
      }
    }
  }

  onSubmit() {
    if (this.expenseForm.invalid) return;

    const formData = this.expenseForm.value as any;

    if (this.editId) {
      // If we have an ID, call the UPDATE method
      this.expenseService.updateExpense(this.editId, formData);
    } else {
      // If no ID, call the standard CREATE method
      this.expenseService.addExpense(formData);
    }

    // Warp back to the dashboard instantly
    this.router.navigate(['/dashboard']);
  }
}