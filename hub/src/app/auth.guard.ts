import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router
  ) { }

  canActivate(): boolean | Promise<boolean> {
    return this.hasValidToken()
      ? true
      : this.router.navigateByUrl('login').then(() => false);
  }

  private hasValidToken(): boolean {
    const token = window.sessionStorage.getItem("token");
    return token !== null;
  }
}
