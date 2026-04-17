import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { DoctorDashboardComponent } from './doctor-dashboard.component';
import { DoctorDashboardRoutingModule } from './doctor-dashboard-routing.module';
import { ChatDoctorComponent } from './pages/chat-doctor/chat-doctor.component';
import { ImageAnalysisModalComponent } from './pages/chat-doctor/modals/image-analysis-modal/image-analysis-modal.component';
import { SendResultModalComponent } from './pages/chat-doctor/modals/send-result-modal/send-result-modal.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { DoctorAppointmentsComponent } from './pages/doctor-appointments/doctor-appointments.component';
import { DoctorReclamationsComponent } from './doctor-reclamations/doctor-reclamations.component';
import { DoctorSendReclamationComponent } from './doctor-send-reclamation/doctor-send-reclamation.component';
import { DoctorGeolocalisationComponent } from './doctor-geolocalisation/doctor-geolocalisation.component';

@NgModule({
  declarations: [
    DoctorDashboardComponent,
    ChatDoctorComponent,
    ImageAnalysisModalComponent,
    SendResultModalComponent,
    AppointmentsComponent,
    DoctorAppointmentsComponent,
    DoctorReclamationsComponent,
    DoctorSendReclamationComponent,
    DoctorGeolocalisationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DoctorDashboardRoutingModule,
    FullCalendarModule
  ]
})
export class DoctorDashboardModule { }