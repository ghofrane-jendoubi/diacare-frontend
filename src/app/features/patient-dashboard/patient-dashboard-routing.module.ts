import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorsListComponent } from './pages/doctors-list/doctors-list.component';
import { ChatComponent } from './pages/chat/chat.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { PatientHomeComponent } from './patient-home/patient-home.component';
import { DiabetesPredictionComponent } from './pages/diabetes-prediction/diabetes-prediction.component';
import { PredictionComponent } from './pages/prediction/prediction.component';
import { PatientChoicesComponent } from './pages/patient-choices/patient-choices.component';


const routes: Routes = [
  { path: '', component: PatientHomeComponent },
  { path: 'choices', component: PatientChoicesComponent },
  { path: 'doctors', component: DoctorsListComponent },
  { path: 'chat/:doctorId', component: ChatComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'prediction', component: DiabetesPredictionComponent },
  { path: 'diabete-prediction', component: PredictionComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientDashboardRoutingModule { }