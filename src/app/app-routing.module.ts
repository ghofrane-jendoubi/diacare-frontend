import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/components/admin-layout/admin-layout.component';
import { DoctorLayoutComponent } from './shared/components/doctor-layout/doctor-layout.component';
import { NutritionnistLayoutComponent } from './shared/components/nutritionnist-layout/nutritionnist-layout.component';
import { HomeComponent } from './features/home/home.component';
import { TestUsersComponent } from './test-users/test-users.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { RoleGuard } from './shared/guards/role.guard';

const routes: Routes = [

  // Page d'accueil publique
  { path: '', component: HomeComponent },

  // Auth – chemins corrigés (modules doivent exister)
  { path: 'login', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
  { path: 'register', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },

  // Espace éducatif (AVANT patient pour éviter conflit)
  {
    path: 'patient/education',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/education/education.module').then(m => m.EducationModule)
  },

  // Espace patient
  {
    path: 'patient',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/patient-home/patient-home.module').then(m => m.PatientHomeModule)
  },

  // Espace admin
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardModule)
      }
    ]
  },

  // Espace médecin
  {
    path: 'doctor',
    component: DoctorLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/doctor-dashboard/doctor-dashboard.module').then(m => m.DoctorDashboardModule)
      }
    ]
  },

  // Espace nutritionniste
  {
    path: 'nutritionnist',
    component: NutritionnistLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/nutritionnist-dashboard/nutritionnist-dashboard.module').then(m => m.NutritionnistDashboardModule)
      }
    ]
  },

  // Test
  { path: 'test-users', component: TestUsersComponent },

  // Fallback
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }