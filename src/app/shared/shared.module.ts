import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Layouts Admin
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';

// Layouts Nutritionniste
import { NutritionnistLayoutComponent } from './components/nutritionnist-layout/nutritionnist-layout.component';
import { NutritionnistSidebarComponent } from './components/nutritionnist-sidebar/nutritionnist-sidebar.component';
import { NutritionnistTopbarComponent } from './components/nutritionnist-topbar/nutritionnist-topbar.component';

// Layouts Médecin
import { DoctorLayoutComponent } from './components/doctor-layout/doctor-layout.component';
import { DoctorSidebarComponent } from './components/doctor-sidebar/doctor-sidebar.component';
import { DoctorTopbarComponent } from './components/doctor-topbar/doctor-topbar.component';

// Composants réutilisables publics
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { PatientSidebarComponent } from './patient-sidebar/patient-sidebar.component';

@NgModule({
  declarations: [
    // Admin
    AdminLayoutComponent,
    SidebarComponent,
    TopbarComponent,
    // Nutritionniste
    NutritionnistLayoutComponent,
    NutritionnistSidebarComponent,
    NutritionnistTopbarComponent,
    // Médecin
    DoctorLayoutComponent,
    DoctorSidebarComponent,
    DoctorTopbarComponent,
    // Public
    NavbarComponent,
    FooterComponent,
    UserDetailComponent,
    PatientSidebarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  exports: [
    // Admin
    AdminLayoutComponent,
    SidebarComponent,
    TopbarComponent,
    // Nutritionniste
    NutritionnistLayoutComponent,
    NutritionnistSidebarComponent,
    NutritionnistTopbarComponent,
    // Médecin
    DoctorLayoutComponent,
    DoctorSidebarComponent,
    DoctorTopbarComponent,
    PatientSidebarComponent, 
    // Public (exportés pour être utilisés partout)
    NavbarComponent,
    FooterComponent
  ]
})
export class SharedModule { }