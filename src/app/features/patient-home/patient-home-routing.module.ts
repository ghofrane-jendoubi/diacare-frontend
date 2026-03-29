import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientHomeComponent } from './patient-home.component';
import { MarketplacePatientComponent } from './marketplace-patient/marketplace-patient.component';
import { CartComponent } from './cart/cart.component';
import { OrdersComponent } from './orders/orders.component';
import { PaiementComponent } from './paiement/paiement.component';

const routes: Routes = [
  { path: '', component: PatientHomeComponent },
  { path: 'marketplace', component: MarketplacePatientComponent },
  { path: 'cart', component: CartComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'paiement', component: PaiementComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientHomeRoutingModule { }