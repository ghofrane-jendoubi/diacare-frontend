import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/components/admin-layout/admin-layout.component';
import { DoctorLayoutComponent } from './shared/components/doctor-layout/doctor-layout.component';
import { NutritionnistLayoutComponent } from './shared/components/nutritionnist-layout/nutritionnist-layout.component';
import { HomeComponent } from './features/home/home.component';
import { TestUsersComponent } from './test-users/test-users.component';

const routes: Routes = [

  // Page d'accueil publique
  { path: '', component: HomeComponent },

  // Espace éducatif (AVANT patient pour éviter conflit de routes)
  {
    path: 'patient/education',
    loadChildren: () => import('./features/education/education.module')
      .then(m => m.EducationModule)
    // Guard retiré temporairement pour les tests
  },

  // Espace patient
  {
    path: 'patient',
    loadChildren: () => import('./features/patient-home/patient-home.module')
      .then(m => m.PatientHomeModule)
  },

  // Espace admin (avec layout)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/admin-dashboard/admin-dashboard.module')
          .then(m => m.AdminDashboardModule)
      }
    ]
  },

  // Espace médecin (avec layout)
  {
    path: 'doctor',
    component: DoctorLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/doctor-dashboard/doctor-dashboard.module')
          .then(m => m.DoctorDashboardModule)
      }
    ]
  },

  // Espace nutritionniste (avec layout)
  {
    path: 'nutritionnist',
    component: NutritionnistLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/nutritionnist-dashboard/nutritionnist-dashboard.module')
          .then(m => m.NutritionnistDashboardModule)
      }
    ]
  },
  {
  path: 'doctor',
  component: DoctorLayoutComponent,
  children: [
    {
      path: '',
      loadChildren: () => import('./features/doctor-dashboard/doctor-dashboard.module')
        .then(m => m.DoctorDashboardModule)
    }
  ]
},

  { path: 'test-users', component: TestUsersComponent },

  // Redirection pour les routes non trouvées
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}