import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import {AuthService} from "./auth.service";

export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (req.url.includes('/auth/')) {
    return next(req);
  }

  const token = authService.getToken();

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401 && isTokenInvalidError(error)) {
            authService.logout().subscribe(() => {
              router.navigate(['/login']);
            });
          }

          return throwError(() => error);
        })
    );
  }

  return next(req);
};

function isTokenInvalidError(error: HttpErrorResponse): boolean {
  return (
      error.error?.message?.includes('Token') ||
      error.error?.error === 'Unauthorized' ||
      error.headers.get('WWW-Authenticate')?.includes('Bearer')
  );
}