import { TestBed } from '@angular/core/testing';

import { UnauthorisedInterceptor } from './401.interceptor';

describe('UnauthorisedInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      UnauthorisedInterceptor
    ]
  }));

  it('should be created', () => {
    const interceptor: UnauthorisedInterceptor = TestBed.inject(UnauthorisedInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
