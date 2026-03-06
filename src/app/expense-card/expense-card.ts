import { Component, input, output } from '@angular/core';
import { Expense } from '../services/expense'; // Adjust the path if your service is elsewhere
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-expense-card',
    standalone: true,
    imports: [CurrencyPipe, DatePipe],
    templateUrl: './expense-card.html',
    styleUrl: './expense-card.css'
})
export class ExpenseCardComponent {

    // 1. Data flowing DOWN: The parent MUST pass an 'Expense' object to this card
    // We use the modern v21 Signal input() instead of the legacy @Input()
    expenseItem = input.required<Expense>();

    // 2. Data flowing UP: The child will emit a string (the ID) when clicked
    delete = output<string>();

    onDeleteClick() {
        // When the button is clicked, we emit the ID up to the parent
        // Since expenseItem is a Signal, we must call it with () to read its value
        this.delete.emit(this.expenseItem().id);
    }
}