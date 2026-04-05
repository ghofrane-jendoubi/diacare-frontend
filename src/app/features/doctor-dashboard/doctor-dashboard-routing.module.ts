import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EducationManagerComponent } from './pages/education-manager/education-manager.component';
import { ArticleEditorComponent } from './pages/article-editor/article-editor.component';
import { CommentsManagerComponent } from './pages/comments-manager/comments-manager.component';

const routes: Routes = [
  { path: 'education', component: EducationManagerComponent },
  { path: 'education/new', component: ArticleEditorComponent },
  { path: 'education/edit/:id', component: ArticleEditorComponent },
  { path: 'education/comments', component: CommentsManagerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorDashboardRoutingModule {}