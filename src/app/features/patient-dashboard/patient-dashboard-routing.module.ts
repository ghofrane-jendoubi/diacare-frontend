import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FoodChatComponent } from './pages/food-chat/food-chat.component';
import { DietPlanViewComponent } from './pages/diet-plan-view/diet-plan-view.component';
import { PatientProfileComponent } from './pages/patient-profile/patient-profile.component';
import { PatientChatComponent } from './pages/patient-chat/patient-chat.component';
import { ProgressComponent } from './pages/progress/progress.component';


const routes: Routes = [
  { path: '', redirectTo: 'nutrition', pathMatch: 'full' },
  { path: 'nutrition', component: FoodChatComponent },
  { path: 'my-plans', component: DietPlanViewComponent },
  { path: 'profile', component: PatientProfileComponent },
  { path: 'chat', component: PatientChatComponent },
  { path: 'progress', component: ProgressComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientDashboardRoutingModule { }