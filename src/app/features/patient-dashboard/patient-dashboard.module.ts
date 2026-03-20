import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PatientDashboardRoutingModule } from './patient-dashboard-routing.module';
import { PatientDashboardComponent } from './patient-dashboard.component';
import { FoodChatComponent } from './pages/food-chat/food-chat.component';
import { DietPlanViewComponent } from './pages/diet-plan-view/diet-plan-view.component';

@NgModule({
  declarations: [
    PatientDashboardComponent,
    FoodChatComponent,
    DietPlanViewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PatientDashboardRoutingModule
  ]
})
export class PatientDashboardModule { }