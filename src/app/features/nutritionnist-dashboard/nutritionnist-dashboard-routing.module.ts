import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NutritionnistDashboardComponent } from './nutritionnist-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: NutritionnistDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NutritionnistDashboardRoutingModule { }