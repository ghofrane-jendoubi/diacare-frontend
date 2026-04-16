import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HomeRoutingModule
  ],
  exports: [HomeComponent]
})
export class HomeModule { }