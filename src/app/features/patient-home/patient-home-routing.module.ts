import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientHomeComponent } from './patient-home.component';
import { FoodChatComponent } from '../patient-dashboard/pages/food-chat/food-chat.component';
import { DietPlanViewComponent } from '../patient-dashboard/pages/diet-plan-view/diet-plan-view.component';

const routes: Routes = [
  { path: '', component: PatientHomeComponent },
   {
    path: 'nutrition',         // /patient/nutrition
    component: FoodChatComponent
  },
  {
    path: 'my-plans',          // /patient/my-plans
    component: DietPlanViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientHomeRoutingModule { }