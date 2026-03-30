import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PatientDashboardRoutingModule } from './patient-dashboard-routing.module';
import { FoodChatComponent } from './pages/food-chat/food-chat.component';
import { DietPlanViewComponent } from './pages/diet-plan-view/diet-plan-view.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PatientProfileComponent } from './pages/patient-profile/patient-profile.component';
import { PatientChatComponent } from './pages/patient-chat/patient-chat.component';
import { ProgressComponent } from './pages/progress/progress.component';

@NgModule({
  declarations: [
    FoodChatComponent,
    DietPlanViewComponent,
    PatientProfileComponent,
    PatientChatComponent,
    ProgressComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule,
    PatientDashboardRoutingModule
  ]
})
export class PatientDashboardModule { }