import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Launcher } from '../apps.service';
import { WebOrDesktopDirective } from '../web-or-desktop.directive';

@Component({
  selector: 'app-launcher',
  templateUrl: './launcher.component.html',
  styleUrls: ['./launcher.component.scss']
})
export class LauncherComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input()
  obj: Launcher | undefined; // fix ts error

  @Output()
  clicked = new EventEmitter<Launcher>();

  launchCount = 0;

  launch() {
    this.launchCount++;
    console.log("LauncherComponent.launch", { obj: this.obj, launchCount: this.launchCount });
    this.clicked.emit(this.obj);
  }

}
