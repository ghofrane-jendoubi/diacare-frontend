import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../shared/shared.module';

import { DoctorDashboardRoutingModule } from './doctor-dashboard-routing.module';
import { EducationManagerComponent } from './pages/education-manager/education-manager.component';
import { ArticleEditorComponent } from './pages/article-editor/article-editor.component';
import { CommentsManagerComponent } from './pages/comments-manager/comments-manager.component';
import { PatientFeedbacksComponent } from './pages/patient-feedbacks/patient-feedbacks.component';

@NgModule({
  declarations: [
    EducationManagerComponent,
    ArticleEditorComponent,
    CommentsManagerComponent,
    PatientFeedbacksComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    SharedModule,
    DoctorDashboardRoutingModule
  ]
})
export class DoctorDashboardModule {}
