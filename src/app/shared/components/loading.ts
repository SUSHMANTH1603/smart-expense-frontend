import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
    // A global signal that tracks if the app is currently loading anything
    isLoading = signal<boolean>(false);

    show() { this.isLoading.set(true); }
    hide() { this.isLoading.set(false); }
}