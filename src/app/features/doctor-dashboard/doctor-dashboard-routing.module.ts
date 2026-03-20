import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorDashboardComponent } from './doctor-dashboard.component';
import { ChatDoctorComponent } from './pages/chat-doctor/chat-doctor.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';

const routes: Routes = [
  {
    path: '',
    component: DoctorDashboardComponent
    
  },
  {
  path: 'chat/:patientId',
  component: ChatDoctorComponent
},
{
  path: 'appointments',
  component: AppointmentsComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorDashboardRoutingModule { }