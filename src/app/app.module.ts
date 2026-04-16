import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxSliderRecaptchaModule } from 'ngx-slider-recaptcha';

import { HomeComponent } from './features/home/home.component';

import { HttpClientModule } from '@angular/common/http';
import { ChooseRoleComponent } from './features/choose-role/choose-role.component';

import { AdminAuthComponent } from './features/auth/admin-auth/admin-auth.component';
import { DoctorAuthComponent } from './features/auth/doctor-auth/doctor-auth.component';
import { NutritionistAuthComponent } from './features/auth/nutritionist-auth/nutritionist-auth.component';
import { PatientAuthComponent } from './features/auth/patient-auth/patient-auth.component';
import { UserListComponent } from './features/user-list/user-list.component';
import { ForgotPasswordComponent } from './features/auth/forgotpassword/forgotpassword.component';
import { HcaptchaComponent, } from './features/auth/recaptcha/hcaptcha.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ChooseRoleComponent,
    AdminAuthComponent,
    DoctorAuthComponent,
    NutritionistAuthComponent,
    PatientAuthComponent,
    UserListComponent,
    ForgotPasswordComponent,
    HcaptchaComponent,  // ✅ OK - composant non-standalone
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgxSliderRecaptchaModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }