import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ngrxImports } from '../app.module';
import { AppsPageComponent } from './apps-page/apps-page.component';
import { appsModule } from './apps.module';

const apps = [{ id: 1, name: 'app 1', typeId: 1 }];

const types = [{ id: 1, name: 'web' }];

@Injectable()
class HttpRequestInterceptorMock implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    switch (request.url) {
      case '/apps':
        return of(new HttpResponse({ status: 200, body: apps }));
      case '/types':
        return of(new HttpResponse({ status: 200, body: types }));
      default:
        return next.handle(request);
    }
  }
}

fdescribe('AppsModule', () => {
  let component: AppsPageComponent;
  let fixture: ComponentFixture<AppsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: appsModule.declarations,
      imports: new Array<any>()
        .concat(appsModule.imports)
        .concat(ngrxImports)
        .concat([RouterModule.forRoot([])]),
      providers: new Array<any>()
        .concat([
          {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpRequestInterceptorMock,
            multi: true,
          },
        ])
        .concat(appsModule.providers),
    }).compileComponents();

    fixture = TestBed.createComponent(AppsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => expect(component).toBeTruthy());

  it('should show one app', () => {
    const html = <HTMLElement>fixture.nativeElement;
    const launchers = Array.prototype.slice.call(
      html.querySelectorAll('app-launcher')
    ) as HTMLElement[];
    expect(launchers.length).toEqual(1);
  });
});
