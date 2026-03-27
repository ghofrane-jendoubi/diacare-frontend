import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';


import { HomeComponent } from './features/home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { ProductListComponent } from './features/admin-dashboard/marketplace/pages/product-list/product-list.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
  
  RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }