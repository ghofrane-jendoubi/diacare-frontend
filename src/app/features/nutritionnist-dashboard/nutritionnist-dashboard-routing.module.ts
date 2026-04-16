import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NutritionnistDashboardComponent } from './nutritionnist-dashboard.component';
import { PlanCreateComponent } from './pages/plan-create/plan-create.component';
import { PatientListComponent } from './pages/patient-list/patient-list.component';
import { PatientDetailComponent } from './pages/patient-detail/patient-detail.component';
import { NutriChatComponent } from './pages/nutri-chat/nutri-chat.component';

const routes: Routes = [
  
      { path: '', component: NutritionnistDashboardComponent },           // Route par défaut
      { path: 'patient/:id', component: PatientDetailComponent },
      { path: 'plan-create/:id', component: PlanCreateComponent },
      { path: 'plan-create', component: PlanCreateComponent },
      { path: 'patient/:id', component: PatientDetailComponent }, // Optionnel: sans ID
      { path: 'chat/:id', component: NutriChatComponent }
   
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NutritionnistDashboardRoutingModule { }