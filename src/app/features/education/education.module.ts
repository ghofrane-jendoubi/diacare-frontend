import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { EducationRoutingModule } from './education-routing.module';
import { EducationHomeComponent } from './pages/education-home/education-home.component';
import { ArticleDetailComponent } from './pages/article-detail/article-detail.component';
import { MyBookmarksComponent } from './pages/my-bookmarks/my-bookmarks.component';
import { ArticleCardComponent } from './components/article-card/article-card.component';
import { ArticleFiltersComponent } from './components/article-filters/article-filters.component';
import { CommentSectionComponent } from './components/comment-section/comment-section.component';
import { CommentSectionDoctorComponent } from './components/comment-section-doctor/comment-section-doctor.component';
import { CommentItemComponent } from './components/comment-item/comment-item.component';
import { HeroBannerComponent } from './components/hero-banner/hero-banner.component';
import { FeedbackModalComponent } from './components/feedback-modal/feedback-modal.component';
import { ChatbotModule } from '../chatbot/chatbot.module';

@NgModule({
  declarations: [
    EducationHomeComponent,
    ArticleDetailComponent,
    MyBookmarksComponent,
    ArticleCardComponent,
    ArticleFiltersComponent,
    CommentSectionComponent,
    CommentSectionDoctorComponent,
    CommentItemComponent,
    HeroBannerComponent,
    FeedbackModalComponent,
  
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    EducationRoutingModule,
    SharedModule,
    ChatbotModule
  ]
})
export class EducationModule {}
