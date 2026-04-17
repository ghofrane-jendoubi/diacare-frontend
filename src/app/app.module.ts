import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PatientReclamationsComponent } from './features/patient-home/patient-reclamations/patient-reclamations.component';
import { UserListComponent } from './features/user-list/user-list.component';
import { PatientAuthComponent } from './features/auth/patient-auth/patient-auth.component';
import { NutritionistAuthComponent } from './features/auth/nutritionist-auth/nutritionist-auth.component';
import { DoctorAuthComponent } from './features/auth/doctor-auth/doctor-auth.component';
import { ChooseRoleComponent } from './features/choose-role/choose-role.component';
import { AdminAuthComponent } from './features/auth/admin-auth/admin-auth.component';
@NgModule({
  declarations: [
    AppComponent,
     ChooseRoleComponent,
    AdminAuthComponent,
    DoctorAuthComponent,
    NutritionistAuthComponent,
    PatientAuthComponent,
    UserListComponent,PatientReclamationsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }