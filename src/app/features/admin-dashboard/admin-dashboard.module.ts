import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardRoutingModule } from './admin-dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeliveryManagementComponent } from './delivery-management/delivery-management.component';

@NgModule({
  declarations: [
    DashboardComponent,
    DeliveryManagementComponent
  ],
  imports: [
    CommonModule,
    AdminDashboardRoutingModule,
    SharedModule,
    FormsModule,
    RouterModule,
     CommonModule,   // ← indispensable pour ngClass, ngIf, etc.
    FormsModule
  ]
})
export class AdminDashboardModule { }
