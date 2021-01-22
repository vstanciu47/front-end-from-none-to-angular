import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { combineLatest, throwError } from 'rxjs';

export interface Launcher {
  id: number;
  name: string;
  // type: "web" | "desktop";
  typeId: number;
  typeName?: string
  valid?: boolean;
}

export interface AppType {
  id: number;
  name: "web" | "desktop" | "mobile";
}

@Injectable()
export class AppsService {
  constructor(
    private http: HttpClient
  ) { }

  // getApps(): Promise<Launcher[]> {
  //   return this.http.get<Launcher[]>("/apps").toPromise()
  //     .then(apps => apps.map(a => (a.valid = ["web", "desktop"].includes(a.type), a)));
  // }

  launchers$ = this.http.get<Launcher[]>('/apps').pipe(
    tap(() => console.log('[Service] Successfully fetched apps'))
  );

  appTypes$ = this.http.get<AppType[]>('/types').pipe(
    shareReplay(1)
  );

  launchersWithTypes$ = combineLatest([this.launchers$, this.appTypes$]).pipe(
    map(([launchers, appTypes]) => {
      return launchers.map((launcher) => ({
          ...launcher,
          typeName: appTypes.find((type) => type.id === launcher.typeId)?.name,
          valid: appTypes.map(type => type.id).includes(launcher.typeId)
        }
      ))
    }),
    catchError((err: Error) => {
      console.log('[Service] I have failed you:', err.message);
      return throwError('This is a user friendly error message');
    })
  )
}
