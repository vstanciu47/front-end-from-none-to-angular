import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface Launcher {
  id: number;
  name: string;
  typeId: number;
  typeName?: string;
  valid?: boolean;
  count?: number
}

export interface AppType {
  id: number;
  name: 'web' | 'desktop' | 'mobile';
}

@Injectable()
export class AppsService {
  constructor(private http: HttpClient) {}

  launchers$ = this.http.get<Launcher[]>('/apps').pipe(
    tap(() => console.log('[Service] Successfully fetched apps')),
    catchError((err: Error) => {
      console.log('[Service] I have failed you:', err.message);
      return throwError('This is a user friendly error message');
    })
  );

  appTypes$ = this.http.get<AppType[]>('/types').pipe(
    tap(() => console.log('[Service] Successfully fetched app types')),
    catchError((err: Error) => {
      console.log('[Service] I have failed you:', err.message);
      return throwError('This is another user friendly error message');
    }),
    shareReplay(1));
}
