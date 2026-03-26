import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { PatientHomeRoutingModule } from './patient-home-routing.module';
import { PatientHomeComponent } from './patient-home.component';
import { SharedModule } from '../../shared/shared.module';
import { IaDashboardComponent } from './components/ia-dashboard/ia-dashboard.component';
import { ForumComponent } from './pages/forum/forum.component';
import { ForumPostCardComponent } from './components/forum-post-card/forum-post-card.component';
import { ForumNewPostComponent } from './components/forum-new-post/forum-new-post.component';

@NgModule({
  declarations: [
    PatientHomeComponent,
    IaDashboardComponent,
    ForumComponent,
    ForumPostCardComponent,
    ForumNewPostComponent
    // ChatbotComponent est déjà dans SharedModule → on le retire d’ici
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    SharedModule,        // SharedModule exporte ChatbotComponent
    PatientHomeRoutingModule
  ]
})
export class PatientHomeModule {}