import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NutritionnistDashboardComponent } from './nutritionnist-dashboard.component';
import { NutritionnistDashboardRoutingModule } from './nutritionnist-dashboard-routing.module';
import { NutritionnistReclamationsComponent } from './nutritionnist-reclamations/nutritionnist-reclamations.component';
import { NutritionnistSendReclamationComponent } from './nutritionnist-send-reclamation/nutritionnist-send-reclamation.component';
import { NutritionnistGeolocalisationComponent } from './nutritionnist-geolocalisation/nutritionnist-geolocalisation.component';

@NgModule({
  declarations: [
    NutritionnistDashboardComponent,
    NutritionnistReclamationsComponent,
    NutritionnistSendReclamationComponent,
    NutritionnistGeolocalisationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NutritionnistDashboardRoutingModule
  ]
})
export class NutritionnistDashboardModule { }