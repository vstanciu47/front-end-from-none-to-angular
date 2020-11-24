import { Component, OnInit } from '@angular/core';
import { AppsService, Launcher } from '../apps.service';

@Component({
  selector: 'app-apps-page',
  templateUrl: './apps-page.component.html',
  styleUrls: ['./apps-page.component.scss']
})
export class AppsPageComponent implements OnInit {

  pageName = "Apps page";

  launchers = new Array<Launcher>();

  constructor(
    private appsService: AppsService
  ) { }

  ngOnInit(): void {
    this.appsService.getApps().then(launchers => this.launchers = launchers);
  }

}
