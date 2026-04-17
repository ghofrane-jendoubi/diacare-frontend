import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorDashboardComponent } from './doctor-dashboard.component';
import { ChatDoctorComponent } from './pages/chat-doctor/chat-doctor.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { DoctorAppointmentsComponent } from './pages/doctor-appointments/doctor-appointments.component';

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
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorDashboardRoutingModule { }