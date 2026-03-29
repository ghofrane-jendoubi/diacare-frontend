import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../shared/components/admin-layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DoctorsListComponent } from './doctors-list/doctors-list.component';
import { NutritionistsListComponent } from './nutritionists-list/nutritionists-list.component';
import { PatientsListComponent } from './patients-list/patients-list.component';
import { UserListComponent } from '../user-list/user-list.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', component: DashboardComponent, title: 'Tableau de bord' },
      { path: 'doctors', component: DoctorsListComponent, title: 'Médecins' },
       { path: 'users/:type', component: UserListComponent },
      { path: 'nutritionists', component: NutritionistsListComponent, title: 'Nutritionnistes' },
      { path: 'patients', component: PatientsListComponent, title: 'Patients' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminDashboardRoutingModule {}