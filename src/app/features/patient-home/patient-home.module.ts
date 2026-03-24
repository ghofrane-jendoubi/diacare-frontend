import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { PatientHomeRoutingModule } from './patient-home-routing.module';
import { PatientHomeComponent } from './patient-home.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    PatientHomeComponent,
   
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    SharedModule,
    PatientHomeRoutingModule
  ]
})
export class PatientHomeModule {}