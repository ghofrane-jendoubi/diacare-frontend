import { CanDeactivateFn } from '@angular/router';
import { ArticleDetailComponent } from '../pages/article-detail/article-detail.component';

export const feedbackExitGuard: CanDeactivateFn<ArticleDetailComponent> = (component) => {
  if (!component) {
    return true;
  }

  return component.canDeactivate();
};
