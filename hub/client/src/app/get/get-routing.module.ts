import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GetComponent } from './get.component';

const routes: Routes = [{ path: '', component: GetComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GetRoutingModule { }
