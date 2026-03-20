import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NutritionnistDashboardComponent } from './nutritionnist-dashboard.component';
import { PlanCreateComponent } from './pages/plan-create/plan-create.component';

const routes: Routes = [
  {
    path: '',
    component: NutritionnistDashboardComponent
  },
  {
    path: 'plan-create',       // /nutritionist/plan-create
    component: PlanCreateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NutritionnistDashboardRoutingModule { }