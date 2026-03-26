import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientHomeComponent } from './patient-home.component';
import { IaDashboardComponent } from './components/ia-dashboard/ia-dashboard.component';
import { ForumComponent } from './pages/forum/forum.component';
const routes: Routes = [
  { path: '', component: PatientHomeComponent },
  { path: 'ia-dashboard', component: IaDashboardComponent },
  { path: 'forum', component: ForumComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientHomeRoutingModule {}