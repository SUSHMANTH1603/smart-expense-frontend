import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ExpenseService } from '../../core/services/expense';
// SDE IMPORT: We need switchMap and 'of' to handle reactive routing
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-expense.html',
  styleUrl: './add-expense.css',

  // 1. DOM TREE OPTIMIZATION: OnPush
  // Tells Angular to stop checking this component's HTML for changes unless 
  // an Input changes or an event (like clicking Submit) fires!
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddExpenseComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  editId: string | null = null;

  expenseForm = new FormGroup({
    title: new FormControl('', Validators.required),
    amount: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    category: new FormControl('', Validators.required)
  });

  ngOnInit() {
    // 2. THE SDE RXJS PATTERN: Using switchMap instead of snapshot
    // A junior dev uses `this.route.snapshot`. But if the URL changes while they are 
    // ALREADY on the page, the snapshot doesn't update, and the app breaks!
    // We subscribe to the URL changes reactively using switchMap.

    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        this.editId = id;

        if (id) {
          // Find the expense. If this was a massive enterprise app, we would use 
          // switchMap here to fire an HTTP GET request to the database!
          const existingExpense = this.expenseService.expenses().find(e => e.id === id);
          return of(existingExpense); // Wraps our data back into an RxJS Observable
        }

        return of(null); // If no ID, return null
      })
    ).subscribe(expense => {
      // Once switchMap finishes its job, we patch the form
      if (expense) {
        this.expenseForm.patchValue({
          title: expense.title,
          amount: expense.amount,
          category: expense.category
        });
      }
    });
  }

  onSubmit() {
    if (this.expenseForm.invalid) return;

    const formData = this.expenseForm.value as any;

    if (this.editId) {
      this.expenseService.updateExpense(this.editId, formData);
    } else {
      this.expenseService.addExpense(formData);
    }

    this.router.navigate(['/dashboard']);
  }
}