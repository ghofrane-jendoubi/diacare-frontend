import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientHomeComponent } from './patient-home.component';
import { MarketplacePatientComponent } from './marketplace-patient/marketplace-patient.component';

const routes: Routes = [
  { path: '', component: PatientHomeComponent },
  { path: 'marketplace', component: MarketplacePatientComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientHomeRoutingModule { }