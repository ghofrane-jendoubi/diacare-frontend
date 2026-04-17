import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChooseRoleComponent } from './features/choose-role/choose-role.component';

import { PatientLayoutComponent } from './shared/components/patient-layout/patient-layout.component';
import { AdminLayoutComponent } from './shared/components/admin-layout/admin-layout.component';
import { DoctorLayoutComponent } from './shared/components/doctor-layout/doctor-layout.component';
import { NutritionnistLayoutComponent } from './shared/components/nutritionnist-layout/nutritionnist-layout.component';

import { PatientReclamationsComponent } from './features/patient-home/patient-reclamations/patient-reclamations.component';
import { DoctorReclamationsComponent } from './features/doctor-dashboard/doctor-reclamations/doctor-reclamations.component';
import { DoctorSendReclamationComponent } from './features/doctor-dashboard/doctor-send-reclamation/doctor-send-reclamation.component';
import { NutritionnistReclamationsComponent } from './features/nutritionnist-dashboard/nutritionnist-reclamations/nutritionnist-reclamations.component';
import { NutritionnistSendReclamationComponent } from './features/nutritionnist-dashboard/nutritionnist-send-reclamation/nutritionnist-send-reclamation.component';
import { AdminReclamationsComponent } from './features/admin-dashboard/admin-reclamations/admin-reclamations.component';

import { PatientGeolocalisationComponent } from './features/patient-dashboard/patient-geolocalisation/patient-geolocalisation.component';
import { DoctorGeolocalisationComponent } from './features/doctor-dashboard/doctor-geolocalisation/doctor-geolocalisation.component';
import { NutritionnistGeolocalisationComponent } from './features/nutritionnist-dashboard/nutritionnist-geolocalisation/nutritionnist-geolocalisation.component';
import { AdminGeolocalisationComponent } from './features/admin-dashboard/admin-geolocalisation/admin-geolocalisation.component';

import { AdminAuthComponent } from './features/auth/admin-auth/admin-auth.component';
import { DoctorAuthComponent } from './features/auth/doctor-auth/doctor-auth.component';
import { NutritionistAuthComponent } from './features/auth/nutritionist-auth/nutritionist-auth.component';
import { PatientAuthComponent } from './features/auth/patient-auth/patient-auth.component';

import { UserListComponent } from './features/user-list/user-list.component';
import { NutritionnistDashboardComponent } from './features/nutritionnist-dashboard/nutritionnist-dashboard.component';

const routes: Routes = [
  { path: '', loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule) },

  {
  path: 'patient',
  component: PatientLayoutComponent,
  children: [
    { path: '', loadChildren: () => import('./features/patient-dashboard/patient-dashboard.module').then(m => m.PatientDashboardModule) },
    { path: 'reclamations', component: PatientReclamationsComponent },
    { path: 'geolocalisation', component: PatientGeolocalisationComponent },
    { path: 'profile', loadChildren: () => import('./features/patient-profile/patient-profile.module').then(m => m.PatientProfileModule) }
  ]
},

  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', loadChildren: () => import('./features/admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardModule) },
      { path: 'reclamations', component: AdminReclamationsComponent },
      { path: 'geolocalisation', component: AdminGeolocalisationComponent }
    ]
  },

  {
    path: 'doctor',
    component: DoctorLayoutComponent,
    children: [
      { path: '', loadChildren: () => import('./features/doctor-dashboard/doctor-dashboard.module').then(m => m.DoctorDashboardModule) },
      { path: 'reclamations', component: DoctorReclamationsComponent },
      { path: 'send-reclamation', component: DoctorSendReclamationComponent },
      { path: 'geolocalisation', component: DoctorGeolocalisationComponent }
    ]
  },

  {
    path: 'nutritionnist',
    component: NutritionnistLayoutComponent,
    children: [
      { path: '', loadChildren: () => import('./features/nutritionnist-dashboard/nutritionnist-dashboard.module').then(m => m.NutritionnistDashboardModule) },
      { path: 'reclamations', component: NutritionnistReclamationsComponent },
      { path: 'send-reclamation', component: NutritionnistSendReclamationComponent },
      { path: 'geolocalisation', component: NutritionnistGeolocalisationComponent }
    ]
  },

  { path: 'choose-role', component: ChooseRoleComponent },
  { path: 'auth/admin', component: AdminAuthComponent },
  { path: 'auth/doctor', component: DoctorAuthComponent },
  { path: 'auth/nutritionist', component: NutritionistAuthComponent },
  { path: 'auth/patient', component: PatientAuthComponent },
  { path: 'users/:type', component: UserListComponent },
  { path: 'nutritionist-dashboard', component: NutritionnistDashboardComponent },

  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking',
    errorHandler: (error) => {
      console.error('Navigation error:', error);
    }
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }