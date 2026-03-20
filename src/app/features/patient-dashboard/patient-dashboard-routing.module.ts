import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientDashboardComponent } from './patient-dashboard.component';
import { FoodChatComponent } from './pages/food-chat/food-chat.component';
import { DietPlanViewComponent } from './pages/diet-plan-view/diet-plan-view.component';

const routes: Routes = [
  {
    path: '',
    component: PatientDashboardComponent,
    children: [
      { path: 'nutrition', component: FoodChatComponent },
      { path: 'my-plans', component: DietPlanViewComponent },
      { path: '', redirectTo: 'nutrition', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientDashboardRoutingModule { }