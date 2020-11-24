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
      : (sessionStorage.removeItem("token"), this.router.navigateByUrl('login').then(() => false));
  }

  private hasValidToken(): boolean {
    const token = window.sessionStorage.getItem("token");
    if (!token) return false;

    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) return false;

    let header: Record<string, any>;
    try {
      header = JSON.parse(atob(tokenParts[0]));
    } catch (_ex: any) {
      return false;
    }
    if (header.header !== "header") return false;

    let payload: Record<string, any>;
    try {
      payload = JSON.parse(atob(tokenParts[1]));
    } catch (_ex: any) {
      return false;
    }
    const now = Date.now();
    const nbf = new Date(payload.nbf * 1000).getTime();
    const exp = new Date(payload.exp * 1000).getTime();
    if (nbf > now) return false;
    if (now > exp) return false;
    if (payload.sub !== "admin") return false;

    return true;
  }
}
