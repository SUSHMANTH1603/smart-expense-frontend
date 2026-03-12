import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  // SDE Concept: Signals for Authentication State
  // We check if a token already exists in localStorage when the app boots up
  currentUserSignal = signal<{ token: string | null }>({
    token: localStorage.getItem('token')
  });

  // REGISTER
  register(credentials: any) {
    return this.http.post(`${this.apiUrl}/register`, credentials);
  }

  // LOGIN (Uses RxJS 'tap' operator)
  login(credentials: any) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials).pipe(
      // The 'tap' operator lets us "peek" at the data passing through the RxJS pipe 
      // without changing it. We use it to save the token to the browser's hard drive!
      tap(response => {
        localStorage.setItem('token', response.token);
        this.currentUserSignal.set({ token: response.token });
      })
    );
  }

  // LOGOUT
  logout() {
    localStorage.removeItem('token');
    this.currentUserSignal.set({ token: null });
  }

  // Helper function to get the token
  getToken() {
    return this.currentUserSignal().token;
  }
}