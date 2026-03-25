import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/components/admin-layout/admin-layout.component';
import { DoctorLayoutComponent } from './shared/components/doctor-layout/doctor-layout.component';
import { NutritionnistLayoutComponent } from './shared/components/nutritionnist-layout/nutritionnist-layout.component';
import { HomeComponent } from './features/home/home.component';
import { PatientLayoutComponent } from './shared/components/patient-layout/patient-layout.component';


const routes: Routes = [
  
  // Page d'accueil publique
  { path: '', component: HomeComponent },
  
  // Espace patient
 {
  path: 'patient',
  component: PatientLayoutComponent,
  children: [
    { path: '', loadChildren: () => import('./features/patient-dashboard/patient-dashboard.module').then(m => m.PatientDashboardModule) }
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
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking', // Garde cette ligne
    errorHandler: (error) => {
      console.error('Navigation error:', error);
      // Ignorer l'erreur de rendu serveur
    }
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }