import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppsPageComponent } from './apps/apps-page/apps-page.component';
import { AppsModule } from './apps/apps.module';
import { LockComponent } from './lock/lock.component';

const routes: Routes = [
  { path: "lock", component: LockComponent },
  { path: "apps", component: AppsPageComponent },
  { path: 'get', loadChildren: () => import('./get/get.module').then(m => m.GetModule) },
  { path: "**", redirectTo: "/" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true }), AppsModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
