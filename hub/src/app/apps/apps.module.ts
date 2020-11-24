import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppsPageComponent } from './apps-page/apps-page.component';
import { FormsModule } from '@angular/forms';
import { AppsService } from './apps.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BearerHeaderInterceptor } from './bearer-header.interceptor';
import { UnauthorisedInterceptor } from './401.interceptor';

@NgModule({
  declarations: [AppsPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    AppsService,
    { provide: HTTP_INTERCEPTORS, useClass: BearerHeaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: UnauthorisedInterceptor, multi: true },
  ]
})
export class AppsModule { }
