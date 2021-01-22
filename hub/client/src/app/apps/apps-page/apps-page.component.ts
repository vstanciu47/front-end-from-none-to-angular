import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, of, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppsService, Launcher } from '../apps.service';

@Component({
  selector: 'app-apps-page',
  templateUrl: './apps-page.component.html',
  styleUrls: ['./apps-page.component.scss'],
})
export class AppsPageComponent implements OnInit {
  pageName = 'Apps page';

  error$ = new Subject<string>();

  appTypes$ = this.appsService.appTypes$;

  launcherTypeSelected$ = new BehaviorSubject<number>(0);

  // launchers = new Array<Launcher>();
  launchers$ = this.appsService.launchersWithTypes$.pipe(
    catchError((error) => {
      this.error$.next(error);
      return EMPTY;
    })
  );

  filteredLaunchers$ = combineLatest([
    this.launchers$,
    this.launcherTypeSelected$,
  ]).pipe(
    map(
      ([launchers, appType]) =>
        launchers.filter((launcher) =>
          appType !== 0 ? launcher.typeId === appType : true
        )
    )
  );

  constructor(private appsService: AppsService) {}

  ngOnInit(): void {
    // this.appsService.getApps().then(launchers => this.launchers = launchers);
  }

  launched($event: Launcher) {
    console.log('AppsPageComponent.launched', { $event });
  }

  typeSelected(target: any) {
    let appType = <HTMLTextAreaElement>target;
    this.launcherTypeSelected$.next(+appType.value);
  }
}
