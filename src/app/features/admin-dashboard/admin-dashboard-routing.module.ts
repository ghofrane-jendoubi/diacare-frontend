import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../shared/components/admin-layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DoctorsListComponent } from './doctors-list/doctors-list.component';
import { NutritionistsListComponent } from './nutritionists-list/nutritionists-list.component';
import { PatientsListComponent } from './patients-list/patients-list.component';
import { UserListComponent } from '../user-list/user-list.component';
import { AdminGeolocalisationComponent } from './admin-geolocalisation/admin-geolocalisation.component';
import { AdminReclamationsComponent } from './admin-reclamations/admin-reclamations.component';
import { DeliveryManagementComponent } from './delivery-management/delivery-management.component';

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
      { path: 'geo', component: AdminGeolocalisationComponent, title: 'geo' },
      { path: 'reclamations', component: AdminReclamationsComponent, title: 'reclamations' },
      {
  path: 'delivery',
  component: DeliveryManagementComponent
}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminDashboardRoutingModule {}