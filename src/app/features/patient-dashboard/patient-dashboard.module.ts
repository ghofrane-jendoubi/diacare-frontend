import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PatientDashboardRoutingModule } from './patient-dashboard-routing.module';
import { DoctorsListComponent } from './pages/doctors-list/doctors-list.component';
import { ChatComponent } from './pages/chat/chat.component';
import { SharedModule } from '../../shared/shared.module';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { NotificationDetailModalComponent } from './modals/notification-detail-modal/notification-detail-modal.component';



@NgModule({
  declarations: [
    DoctorsListComponent,
    ChatComponent,
    NotificationsComponent,
    NotificationDetailModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PatientDashboardRoutingModule,
    SharedModule 
  ]
})
export class PatientDashboardModule { }