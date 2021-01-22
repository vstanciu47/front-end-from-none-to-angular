import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  userName = "";

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  login() {
    if (!this.userName) return;

    // create a fake JWT token (in a real world scenario this is received from oauth server)
    const header = {
      header: "header"
    };
    const payload = {
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(new Date(Date.now() + 60 * 60 * 1000).getTime() / 1000), // 1 hour validity
      sub: this.userName // the user id will be bound to this field in a real world scenario
    };
    const signature = "signature";

    const encode = (obj: Object) => window.btoa(JSON.stringify(obj)).replace(/=+$/g, "");

    const token = `${encode(header)}.${encode(payload)}.${encode(signature)}`;
    window.sessionStorage.setItem("token", token);

    this.router.navigateByUrl(`apps`);
  }
}
