import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NutritionnistDashboardComponent } from './nutritionnist-dashboard.component';
import { NutritionnistDashboardRoutingModule } from './nutritionnist-dashboard-routing.module';
import { PlanCreateComponent } from './pages/plan-create/plan-create.component';

@NgModule({
  declarations: [
    NutritionnistDashboardComponent,
    PlanCreateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NutritionnistDashboardRoutingModule
  ]
})
export class NutritionnistDashboardModule { }