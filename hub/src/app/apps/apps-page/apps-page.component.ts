import { Component, OnInit } from '@angular/core';
import { Launcher } from '../apps.service';
import { select, Store } from '@ngrx/store';
import * as fromApps from './../state';
import * as appsActions from './../state/apps.actions';

@Component({
  selector: 'app-apps-page',
  templateUrl: './apps-page.component.html',
  styleUrls: ['./apps-page.component.scss'],
})
export class AppsPageComponent implements OnInit {
  pageName = 'Apps page';

  appTypes$ = this.store.pipe(
    select(fromApps.getTypes)
  )

  filteredLaunchers$ = this.store.pipe(
    select(fromApps.getFilteredApps)
  )

  error$ = this.store.pipe(
    select(fromApps.getError)
  )

  constructor(private store: Store<fromApps.State>) {}

  ngOnInit(): void {
    this.store.dispatch(new appsActions.LoadApps());
    this.store.dispatch(new appsActions.LoadTypes());
  }

  launched($event: Launcher) {
    console.log('AppsPageComponent.launched', { $event });
    this.store.dispatch(new appsActions.LauncherClicked($event.id));
  }

  typeSelected(target: any) {
    let appType = <HTMLTextAreaElement>target;
    this.store.dispatch(new appsActions.SelectType(+appType.value));
  }
}
