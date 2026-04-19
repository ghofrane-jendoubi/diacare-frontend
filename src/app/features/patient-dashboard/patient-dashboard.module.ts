import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PatientDashboardRoutingModule } from './patient-dashboard-routing.module';
import { DoctorsListComponent } from './pages/doctors-list/doctors-list.component';
import { ChatComponent } from './pages/chat/chat.component';
import { SharedModule } from '../../shared/shared.module';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { NotificationDetailModalComponent } from './modals/notification-detail-modal/notification-detail-modal.component';
import { PaymentModalComponent } from './modals/payment-modal/payment-modal.component';
import { DiabetesPredictionComponent } from './pages/diabetes-prediction/diabetes-prediction.component';
import { RiskLevelPipe } from './pipes/risk-level.pipe';
import { PredictionComponent } from './pages/prediction/prediction.component';
import { PatientChoicesComponent } from './pages/patient-choices/patient-choices.component'; 
import { FoodChatComponent } from './pages/food-chat/food-chat.component';
import { DietPlanViewComponent } from './pages/diet-plan-view/diet-plan-view.component';
import { PatientChatComponent } from './pages/patient-chat/patient-chat.component';
import { ProgressComponent } from './pages/progress/progress.component';
import { PatientProfileComponent } from './pages/patient-profile/patient-profile.component';
import { PatientReclamationsComponent } from './patient-reclamations/patient-reclamations.component';
import { PatientGeolocalisationComponent } from './patient-geolocalisation/patient-geolocalisation.component';
import { PatientNutritionistsComponent } from './pages/patient-nutritionists/patient-nutritionists.component';

@NgModule({
  declarations: [
    DoctorsListComponent,
    ChatComponent,
    NotificationsComponent,
    NotificationDetailModalComponent,
    PaymentModalComponent,
    DiabetesPredictionComponent,
    RiskLevelPipe,
    PredictionComponent,
    PatientChoicesComponent,
    FoodChatComponent,
    DietPlanViewComponent,
    PatientProfileComponent,
    PatientChatComponent,
    ProgressComponent,
    PatientReclamationsComponent,
    PatientGeolocalisationComponent,
    PatientNutritionistsComponent
    
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    PatientDashboardRoutingModule,
    SharedModule 
  ]
})
export class PatientDashboardModule { }