import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UserListComponent } from './features/user-list/user-list.component';
import { PatientAuthComponent } from './features/auth/patient-auth/patient-auth.component';
import { NutritionistAuthComponent } from './features/auth/nutritionist-auth/nutritionist-auth.component';
import { DoctorAuthComponent } from './features/auth/doctor-auth/doctor-auth.component';
import { ChooseRoleComponent } from './features/choose-role/choose-role.component';
import { AdminAuthComponent } from './features/auth/admin-auth/admin-auth.component';

import { NgxSliderRecaptchaModule } from 'ngx-slider-recaptcha';
import { NgxCaptchaModule } from 'ngx-captcha';

import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './features/home/home.component';


import { ForgotPasswordComponent } from './features/auth/forgotpassword/forgotpassword.component';
import { HcaptchaComponent, } from './features/auth/recaptcha/hcaptcha.component';
import { MarketplacePatientComponent } from './features/patient-dashboard/pages/marketplace-patient/marketplace-patient.component';

@NgModule({
  declarations: [
    AppComponent,
     ChooseRoleComponent,
    ChooseRoleComponent,
    AdminAuthComponent,
    DoctorAuthComponent,
    NutritionistAuthComponent,
    PatientAuthComponent,
    UserListComponent,
    ForgotPasswordComponent,
    HcaptchaComponent,   ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgxCaptchaModule ,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }