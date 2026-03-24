import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { NutritionnistLayoutComponent } from './components/nutritionnist-layout/nutritionnist-layout.component';
import { NutritionnistSidebarComponent } from './components/nutritionnist-sidebar/nutritionnist-sidebar.component';
import { NutritionnistTopbarComponent } from './components/nutritionnist-topbar/nutritionnist-topbar.component';
import { DoctorLayoutComponent } from './components/doctor-layout/doctor-layout.component';
import { DoctorSidebarComponent } from './components/doctor-sidebar/doctor-sidebar.component';
import { DoctorTopbarComponent } from './components/doctor-topbar/doctor-topbar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ChatbotComponent } from '../features/patient-home/components/chatbot/chatbot.component';
import { SafePipe } from './pipes/safe.pipe';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    SidebarComponent,
    TopbarComponent,
    NutritionnistLayoutComponent,
    NutritionnistSidebarComponent,
    NutritionnistTopbarComponent,
    DoctorLayoutComponent,
    DoctorSidebarComponent,
    DoctorTopbarComponent,
    NavbarComponent,
    FooterComponent,
    ChatbotComponent,
    SafePipe
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule
  ],
  exports: [
    AdminLayoutComponent,
    SidebarComponent,
    TopbarComponent,
    NutritionnistLayoutComponent,
    NutritionnistSidebarComponent,
    NutritionnistTopbarComponent,
    DoctorLayoutComponent,
    DoctorSidebarComponent,
    DoctorTopbarComponent,
    NavbarComponent,
    FooterComponent,
    ChatbotComponent,
    SafePipe
  ]
})
export class SharedModule {}