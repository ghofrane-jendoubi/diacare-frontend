import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EducationHomeComponent } from './pages/education-home/education-home.component';
import { ArticleDetailComponent } from './pages/article-detail/article-detail.component';
import { MyBookmarksComponent } from './pages/my-bookmarks/my-bookmarks.component';

const routes: Routes = [
  { path: '', component: EducationHomeComponent },
  { path: 'article/:id', component: ArticleDetailComponent },
  { path: 'my-bookmarks', component: MyBookmarksComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EducationRoutingModule {}