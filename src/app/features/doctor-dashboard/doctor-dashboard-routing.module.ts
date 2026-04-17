import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorDashboardComponent } from './doctor-dashboard.component';
import { ChatDoctorComponent } from './pages/chat-doctor/chat-doctor.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { DoctorAppointmentsComponent } from './pages/doctor-appointments/doctor-appointments.component';
import { EducationManagerComponent } from './pages/education-manager/education-manager.component';
import { ArticleEditorComponent } from './pages/article-editor/article-editor.component';
import { CommentsManagerComponent } from './pages/comments-manager/comments-manager.component';
import { PatientFeedbacksComponent } from './pages/patient-feedbacks/patient-feedbacks.component';

const routes: Routes = [
  {
    path: '',
    component: DoctorDashboardComponent
    
  },
  {
    path: 'chat',
    component: ChatDoctorComponent
  },

  {
  path: 'chat/:patientId',
  component: ChatDoctorComponent
},
{
  path: 'appointments',
  component: AppointmentsComponent
},
{
  path: 'doctor_appointments',
  component: DoctorAppointmentsComponent
},
{ path: 'education', component: EducationManagerComponent },
  { path: 'education/new', component: ArticleEditorComponent },
  { path: 'education/edit/:id', component: ArticleEditorComponent },
  { path: 'education/comments', component: CommentsManagerComponent },
  { path: 'feedbacks', component: PatientFeedbacksComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorDashboardRoutingModule {}
