import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { DoctorDashboardRoutingModule } from './doctor-dashboard-routing.module';
import { EducationManagerComponent } from './pages/education-manager/education-manager.component';
import { ArticleEditorComponent } from './pages/article-editor/article-editor.component';
import { CommentsManagerComponent } from './pages/comments-manager/comments-manager.component';
import { MessagesInboxComponent } from './pages/messages-inbox/messages-inbox.component';

@NgModule({
  declarations: [
    EducationManagerComponent,
    ArticleEditorComponent,
    CommentsManagerComponent,
    MessagesInboxComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    DoctorDashboardRoutingModule
  ]
})
export class DoctorDashboardModule {}