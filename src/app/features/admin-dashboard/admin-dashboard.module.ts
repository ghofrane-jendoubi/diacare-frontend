import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AdminDashboardRoutingModule } from './admin-dashboard-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { DoctorsListComponent } from './doctors-list/doctors-list.component';
import { NutritionistsListComponent } from './nutritionists-list/nutritionists-list.component';
import { PatientsListComponent } from './patients-list/patients-list.component';
import { AdminReclamationsComponent } from './admin-reclamations/admin-reclamations.component';
import { AdminGeolocalisationComponent } from './admin-geolocalisation/admin-geolocalisation.component';

@NgModule({
  declarations: [
    DashboardComponent,
    DoctorsListComponent,
    NutritionistsListComponent,
    PatientsListComponent,
    AdminReclamationsComponent,
    AdminGeolocalisationComponent
  ],
  imports: [
    CommonModule,
    AdminDashboardRoutingModule,
    SharedModule,
    FormsModule,
    RouterModule,
    HttpClientModule
  ]
})
export class AdminDashboardModule {}