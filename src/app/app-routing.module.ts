import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChooseRoleComponent } from './features/choose-role/choose-role.component';

import { PatientLayoutComponent } from './shared/components/patient-layout/patient-layout.component';


import { AdminAuthComponent } from './features/auth/admin-auth/admin-auth.component';
import { DoctorAuthComponent } from './features/auth/doctor-auth/doctor-auth.component';
import { NutritionistAuthComponent } from './features/auth/nutritionist-auth/nutritionist-auth.component';
import { PatientAuthComponent } from './features/auth/patient-auth/patient-auth.component';
import { UserListComponent } from './features/user-list/user-list.component';
import { NutritionnistDashboardComponent } from './features/nutritionnist-dashboard/nutritionnist-dashboard.component';
import { AdminLayoutComponent } from './shared/components/admin-layout/admin-layout.component';
import { DoctorLayoutComponent } from './shared/components/doctor-layout/doctor-layout.component';
import { NutritionnistLayoutComponent } from './shared/components/nutritionnist-layout/nutritionnist-layout.component';

const routes: Routes = [
    { path: '', loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule) },

  
  // Espace patient
 {
  path: 'patient',
  component: PatientLayoutComponent,
  children: [
    { path: '', loadChildren: () => import('./features/patient-dashboard/patient-dashboard.module').then(m => m.PatientDashboardModule) },
     { 
        path: 'profile', 
        loadChildren: () => import('./features/patient-profile/patient-profile.module').then(m => m.PatientProfileModule) 
      },
  ]
},
  // Espace admin
  { 
    path: 'admin', 
    component: AdminLayoutComponent,
    children: [
      { path: '', loadChildren: () => import('./features/admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardModule) }
    ]
  },
  
  // Espace médecin (avec layout)
  { 
    path: 'doctor', 
    component: DoctorLayoutComponent,
    children: [
      { path: '', loadChildren: () => import('./features/doctor-dashboard/doctor-dashboard.module').then(m => m.DoctorDashboardModule) }
    ]
  },
  
  
  // Espace nutritionniste (avec layout)
  { 
    path: 'nutritionnist', 
    component: NutritionnistLayoutComponent,
    children: [
      { path: '', loadChildren: () => import('./features/nutritionnist-dashboard/nutritionnist-dashboard.module').then(m => m.NutritionnistDashboardModule) }
    ]
  },
  { 
    path: 'nutritionnist', 
    component: NutritionnistLayoutComponent,
    children: [
      { path: '', loadChildren: () => import('./features/nutritionnist-dashboard/nutritionnist-dashboard.module').then(m => m.NutritionnistDashboardModule) }
    ]
  },
  
  // Redirection pour les routes non trouvées

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
  { path: 'patient', loadChildren: () => import('./features/patient-dashboard/patient-home/patient-home.module').then(m => m.PatientHomeModule) },
 { path: 'nutritionist-dashboard', component: NutritionnistDashboardComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking', 
    errorHandler: (error) => {
      console.error('Navigation error:', error);
      // Ignorer l'erreur de rendu serveur
    }
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }