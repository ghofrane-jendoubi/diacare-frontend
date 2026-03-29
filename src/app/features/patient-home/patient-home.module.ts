import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PatientHomeRoutingModule } from './patient-home-routing.module';
import { PatientHomeComponent } from './patient-home.component';
import { MarketplacePatientComponent } from './marketplace-patient/marketplace-patient.component';
// Import the header and footer components

import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { CartComponent } from './cart/cart.component';
import { OrdersComponent } from './orders/orders.component';
import { PaiementComponent } from './paiement/paiement.component';
@NgModule({
  declarations: [
    PatientHomeComponent,
    MarketplacePatientComponent,
    CartComponent,
    OrdersComponent,
    PaiementComponent ,
      // <-- must be present
  ],
  imports: [
    CommonModule,
    RouterModule,
    PatientHomeRoutingModule,
    SharedModule,
    FormsModule
  ]
})
export class PatientHomeModule { }