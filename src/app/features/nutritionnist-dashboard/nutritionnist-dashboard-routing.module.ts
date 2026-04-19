import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NutritionnistDashboardComponent } from './nutritionnist-dashboard.component';
import { PlanCreateComponent } from './pages/plan-create/plan-create.component';
import { PatientListComponent } from './pages/patient-list/patient-list.component';
import { PatientDetailComponent } from './pages/patient-detail/patient-detail.component';
import { NutriChatComponent } from './pages/nutri-chat/nutri-chat.component';
import { NutritionnistReclamationsComponent } from './nutritionnist-reclamations/nutritionnist-reclamations.component';
import { NutritionnistGeolocalisationComponent } from './nutritionnist-geolocalisation/nutritionnist-geolocalisation.component';
import { NutritionnistSendReclamationComponent } from './nutritionnist-send-reclamation/nutritionnist-send-reclamation.component';
import { PatientNutritionistsComponent } from '../patient-dashboard/pages/patient-nutritionists/patient-nutritionists.component';
import { NutritionistPatientsComponent } from './pages/nutritionist-patients/nutritionist-patients.component';

const routes: Routes = [
  
      { path: '', component: NutritionnistDashboardComponent },           // Route par défaut
      { path: 'patient/:id', component: PatientDetailComponent },
      { path: 'patients', component: NutritionistPatientsComponent },
      { path: 'plan-create/:id', component: PlanCreateComponent },
      { path: 'plan-create', component: PlanCreateComponent },
      { path: 'patient/:id', component: PatientDetailComponent }, 
      { path: 'chat/:id', component: NutriChatComponent },
      { path: 'reclamation', component: NutritionnistReclamationsComponent },
      { path: 'geo', component: NutritionnistGeolocalisationComponent},
      { path: 'send_reclamation', component: NutritionnistSendReclamationComponent},
   
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NutritionnistDashboardRoutingModule { }