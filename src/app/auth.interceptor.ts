import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { LoadingService } from './services/loading';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const loadingService = inject(LoadingService);
    const token = localStorage.getItem('token');

    // 1. Turn on the loading bar the moment a request starts
    loadingService.show();

    // 2. The REQUEST Interceptor (Adding the token)
    let clonedReq = req;
    if (token) {
        clonedReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    }

    // 3. The RESPONSE Interceptor
    return next(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
            console.error('Global HTTP Error Caught:', error.message);
            if (error.status === 401) {
                // Kick them to login if the token expired!
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            return throwError(() => error);
        }),
        // 4. Finalize ALWAYS runs, whether the request succeeded or failed
        finalize(() => {
            // THE SDE FIX: Force the bar to stay visible for 500ms so human eyes can see it!
            setTimeout(() => {
                loadingService.hide();
            }, 300);
        })
    );
};