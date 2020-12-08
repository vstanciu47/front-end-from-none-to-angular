import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { Launcher } from './apps.service';

@Directive({ selector: '[appWebOrDesktop]' })
export class WebOrDesktopDirective implements OnInit {
  @Input() appWebOrDesktop: Launcher | undefined;

  constructor(private el: ElementRef) {
    //// improper async usage (with delayed execution); this works most times, but there are no guarantees it will
    //setTimeout(() => this.init());

    //// wrong sync usage; this will never work in any circumstances
    //this.init();
  }

  // proper usage (with angular's lifecycle hooks)
  ngOnInit() {
    this.init();
  }

  private init() {
    this.el.nativeElement.style.color = ((type?: Launcher["type"]) => {
      switch (type) {
        case "web": return "green";
        case "desktop": return "red";
        default: return "gray";
      }
    })(this.appWebOrDesktop?.type);
  }
}
