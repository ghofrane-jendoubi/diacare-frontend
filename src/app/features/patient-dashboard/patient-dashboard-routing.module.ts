import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorsListComponent } from './pages/doctors-list/doctors-list.component';
import { ChatComponent } from './pages/chat/chat.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { PatientHomeComponent } from './patient-home/patient-home.component';


const routes: Routes = [
  { path: '', component: PatientHomeComponent },
  { path: 'doctors', component: DoctorsListComponent },
  { path: 'chat/:doctorId', component: ChatComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'notifications', component: NotificationsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientDashboardRoutingModule { }