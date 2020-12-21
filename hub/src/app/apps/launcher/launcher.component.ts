import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { scan } from 'rxjs/operators';
import { Launcher } from '../apps.service';

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

  launchCount$ : Observable<number> = this.clicked.pipe(
    scan((acc) => acc + 1, 0)
  )

  launch() {
    this.clicked.emit(this.obj);
  }

}
