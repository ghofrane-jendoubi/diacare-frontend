import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChooseRoleComponent } from './features/choose-role/choose-role.component';
import { HomeComponent } from './features/home/home.component';
import { AdminAuthComponent } from './features/auth/admin-auth/admin-auth.component';
import { DoctorAuthComponent } from './features/auth/doctor-auth/doctor-auth.component';
import { NutritionistAuthComponent } from './features/auth/nutritionist-auth/nutritionist-auth.component';
import { PatientAuthComponent } from './features/auth/patient-auth/patient-auth.component';
import { UserListComponent } from './features/user-list/user-list.component';
import { NutritionnistDashboardComponent } from './features/nutritionnist-dashboard/nutritionnist-dashboard.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'choose-role', component: ChooseRoleComponent },
  { path: 'auth/admin', component: AdminAuthComponent },
  { path: 'auth/doctor', component: DoctorAuthComponent },
  { path: 'auth/nutritionist', component: NutritionistAuthComponent },
  { path: 'auth/patient', component: PatientAuthComponent },
 { path: 'users/:type', component: UserListComponent },
  // Dashboard routes (après login)
  { path: 'admin', loadChildren: () => import('./features/admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardModule) },
  { path: 'doctor', loadChildren: () => import('./features/doctor-dashboard/doctor-dashboard.module').then(m => m.DoctorDashboardModule) },
  { path: 'nutritionnist', loadChildren: () => import('./features/nutritionnist-dashboard/nutritionnist-dashboard.module').then(m => m.NutritionnistDashboardModule) },
  { path: 'patient', loadChildren: () => import('./features/patient-home/patient-home.module').then(m => m.PatientHomeModule) },
 { path: 'nutritionist-dashboard', component: NutritionnistDashboardComponent },
 {
  path: 'patient/profile',
  loadChildren: () =>
    import('./features/patient-profile/patient-profile.module')
      .then(m => m.PatientProfileModule)
},
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }