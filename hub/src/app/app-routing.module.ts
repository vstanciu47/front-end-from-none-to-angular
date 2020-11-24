import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppsPageComponent } from './apps/apps-page/apps-page.component';
import { AppsModule } from './apps/apps.module';
import { AuthGuard } from './auth.guard';
import { LockComponent } from './lock/lock.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: "", redirectTo: "apps", pathMatch: "full" },

  { path: "lock", component: LockComponent },
  { path: "apps", component: AppsPageComponent, canActivate: [AuthGuard] },
  { path: 'get', loadChildren: () => import('./get/get.module').then(m => m.GetModule) },
  { path: "login", component: LoginComponent },

  { path: "**", redirectTo: "/" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true }), AppsModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
