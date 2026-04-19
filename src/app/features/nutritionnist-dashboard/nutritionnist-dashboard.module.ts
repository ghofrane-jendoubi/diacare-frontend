import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NutritionnistDashboardComponent } from './nutritionnist-dashboard.component';
import { NutritionnistDashboardRoutingModule } from './nutritionnist-dashboard-routing.module';
import { PlanCreateComponent } from './pages/plan-create/plan-create.component';
import { PatientListComponent } from './pages/patient-list/patient-list.component';
import { PatientDetailComponent } from './pages/patient-detail/patient-detail.component';
import { NutriChatComponent } from './pages/nutri-chat/nutri-chat.component';
import { NutritionnistGeolocalisationComponent } from './nutritionnist-geolocalisation/nutritionnist-geolocalisation.component';
import { NutritionnistSendReclamationComponent } from './nutritionnist-send-reclamation/nutritionnist-send-reclamation.component';
import { NutritionnistReclamationsComponent } from './nutritionnist-reclamations/nutritionnist-reclamations.component';
import { NutritionistPatientsComponent } from './pages/nutritionist-patients/nutritionist-patients.component';

@NgModule({
  declarations: [
    NutritionnistDashboardComponent,
    PlanCreateComponent,
    PatientListComponent,
    PatientDetailComponent,
    NutriChatComponent,
    NutritionnistGeolocalisationComponent,
    NutritionnistSendReclamationComponent,
    NutritionnistReclamationsComponent,
    NutritionistPatientsComponent,
    NutritionistPatientsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NutritionnistDashboardRoutingModule
  ]
})
export class NutritionnistDashboardModule { }