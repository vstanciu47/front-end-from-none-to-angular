import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class BearerHeaderInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.toLowerCase().startsWith("/apps")) {
      // create a fake JWT token (this would normally be received from oauth server)
      const token = `fake.jwt.token`;

      // read the token from memory/storage and append it to request auth header
      request = request.clone({
        headers: request.headers.append("Authorization", `Bearer ${token}`)
      });
    }

    return next.handle(request);
  }
}
