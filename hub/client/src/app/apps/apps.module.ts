import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppsPageComponent } from './apps-page/apps-page.component';
import { FormsModule } from '@angular/forms';
import { AppsService } from './apps.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BearerHeaderInterceptor } from './bearer-header.interceptor';
import { UnauthorisedInterceptor } from './401.interceptor';
import { LauncherComponent } from './launcher/launcher.component';
import { NameitPipe } from './nameit.pipe';
import { WebOrDesktopDirective } from './web-or-desktop.directive';
import { LauncherValidatorDirective } from './launcher-validator.directive';
import { EffectsModule } from '@ngrx/effects';
import { reducer } from './state/apps.reducer';
import { StoreModule } from '@ngrx/store'
import { AppsEffects } from './state/apps.effects';

@NgModule({
  declarations: [AppsPageComponent, LauncherComponent, NameitPipe, WebOrDesktopDirective, LauncherValidatorDirective],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    StoreModule.forFeature('apps', reducer),
    EffectsModule.forFeature(
      [ AppsEffects ]
    ),
  ],
  providers: [
    AppsService,
    { provide: HTTP_INTERCEPTORS, useClass: BearerHeaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: UnauthorisedInterceptor, multi: true },
  ]
})
export class AppsModule { }
