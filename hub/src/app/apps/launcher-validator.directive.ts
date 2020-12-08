import { Directive, ElementRef, Input } from '@angular/core';
import { Launcher } from './apps.service';

@Directive({ selector: '[launcherValidator]' })
export class LauncherValidatorDirective {
  @Input() launcherValidator: Launcher | undefined;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    if (this.launcherValidator?.valid === false)
      this.elementRef.nativeElement.parentNode?.removeChild(this.elementRef.nativeElement);
  }
}
