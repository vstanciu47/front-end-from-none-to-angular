import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GetRoutingModule } from './get-routing.module';
import { GetComponent } from './get.component';


@NgModule({
  declarations: [GetComponent],
  imports: [
    CommonModule,
    GetRoutingModule
  ]
})
export class GetModule { }
