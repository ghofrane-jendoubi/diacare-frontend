import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PatientProfileComponent } from './patient-profile/patient-profile.component';
import { PatientProfileRoutingModule } from './patient-profile-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [PatientProfileComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PatientProfileRoutingModule,
    SharedModule
  ]
})
export class PatientProfileModule { }