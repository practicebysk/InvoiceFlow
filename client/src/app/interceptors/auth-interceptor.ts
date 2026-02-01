import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, throwError } from 'rxjs';
import { Common } from '../services/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const common = inject(Common);
  let token = common.getAuthToken() || '';
  const authReq = req.clone({
    setHeaders: { 'Authorization': `Bearer ${token}` }
  });
  return next(authReq).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && (err.status === 0 || err.error?.name === 'AbortError')) {
        return EMPTY;
      }

      if (err instanceof HttpErrorResponse && err.status === 401) {
        common.logOut();
        return EMPTY;
      }

      if (err instanceof HttpErrorResponse) {
        const message = err.error?.error || 'Server error';
        common.snackBar(message);
        return throwError(() => err);
      }

      return throwError(() => err);
    })
  );
};
