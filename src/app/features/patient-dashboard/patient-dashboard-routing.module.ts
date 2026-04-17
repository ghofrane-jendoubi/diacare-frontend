import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorsListComponent } from './pages/doctors-list/doctors-list.component';
import { ChatComponent } from './pages/chat/chat.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { PatientHomeComponent } from './patient-home/patient-home.component';
import { DiabetesPredictionComponent } from './pages/diabetes-prediction/diabetes-prediction.component';
import { PredictionComponent } from './pages/prediction/prediction.component';
import { PatientChoicesComponent } from './pages/patient-choices/patient-choices.component';
import { FoodChatComponent } from './pages/food-chat/food-chat.component';
import { DietPlanViewComponent } from './pages/diet-plan-view/diet-plan-view.component';
import { PatientChatComponent } from './pages/patient-chat/patient-chat.component';
import { ProgressComponent } from './pages/progress/progress.component';
import { PatientProfileComponent } from './pages/patient-profile/patient-profile.component';

const routes: Routes = [
  { path: '', component: PatientHomeComponent },
  { path: 'choices', component: PatientChoicesComponent },
  { path: 'doctors', component: DoctorsListComponent },
  { path: 'chat/:doctorId', component: ChatComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'prediction', component: DiabetesPredictionComponent },
  { path: 'diabete-prediction', component: PredictionComponent },
  
  { path: 'nutrition', component: FoodChatComponent },
  { path: 'my-plans', component: DietPlanViewComponent },
  { path: 'profile', component: PatientProfileComponent },
  { path: 'nutrition-chat', component: PatientChatComponent },
  { path: 'progress', component: ProgressComponent },
  { path: 'education', loadChildren: () => import('../education/education.module').then(m => m.EducationModule) }  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientDashboardRoutingModule { }