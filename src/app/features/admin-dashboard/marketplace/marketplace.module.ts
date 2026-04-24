import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketplaceRoutingModule } from './marketplace-routing.module';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ProductListComponent
  ],
  imports: [
    CommonModule,
    MarketplaceRoutingModule,
    FormsModule,
    
  ]
})
export class MarketplaceModule { }
