import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class UnauthorisedInterceptor implements HttpInterceptor {

  constructor(
    private router: Router
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // this doesn't touch the request object, it only checks responses
    return next.handle(request).pipe( // "pipe" into the response
      catchError(error => {
        // check if response is 401
        if (error.status === 401)
          this.router.navigateByUrl(`login`); // navigate to login page

        // throw the error back to caller
        return throwError(error);
      })
    );
  }
}
