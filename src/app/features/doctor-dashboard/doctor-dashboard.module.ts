import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { DoctorDashboardComponent } from './doctor-dashboard.component';
import { DoctorDashboardRoutingModule } from './doctor-dashboard-routing.module';
import { ChatDoctorComponent } from './pages/chat-doctor/chat-doctor.component';
import { ImageAnalysisModalComponent } from './pages/chat-doctor/modals/image-analysis-modal/image-analysis-modal.component';
import { SendResultModalComponent } from './pages/chat-doctor/modals/send-result-modal/send-result-modal.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { DoctorAppointmentsComponent } from './pages/doctor-appointments/doctor-appointments.component';
import { ArticleEditorComponent } from './pages/article-editor/article-editor.component';
import { CommentsManagerComponent } from './pages/comments-manager/comments-manager.component';
import { EducationManagerComponent } from './pages/education-manager/education-manager.component';
import { PatientFeedbacksComponent } from './pages/patient-feedbacks/patient-feedbacks.component';
import { SafePipe } from '../../shared/pipes/safe.pipe';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    DoctorDashboardComponent,
    ChatDoctorComponent,
    ImageAnalysisModalComponent,
    SendResultModalComponent,
    AppointmentsComponent,
    DoctorAppointmentsComponent,
    ArticleEditorComponent,
    CommentsManagerComponent,
    EducationManagerComponent,
    PatientFeedbacksComponent,
  

  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DoctorDashboardRoutingModule,
    FullCalendarModule,
    SharedModule
  ]
})
export class DoctorDashboardModule {}
