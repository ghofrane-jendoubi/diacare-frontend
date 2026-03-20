import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ContentSummary, CATEGORY_LABELS, CATEGORY_ICONS, DIFFICULTY_LABELS } from '../../models/content';
import { EducationService } from '../../services/education.service';

@Component({
  selector: 'app-article-card',
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.css']
})
export class ArticleCardComponent {
  @Input() article!: ContentSummary;
  @Output() liked = new EventEmitter<number>();
  @Output() bookmarked = new EventEmitter<number>();

  categoryLabels = CATEGORY_LABELS;
  categoryIcons = CATEGORY_ICONS;
  difficultyLabels = DIFFICULTY_LABELS;

  constructor(private educationService: EducationService, private router: Router) {}

  onLike(event: Event) {
    event.stopPropagation();
    this.educationService.toggleLike(this.article.id).subscribe(res => {
      this.article.isLiked = res.liked;
      this.article.likeCount += res.liked ? 1 : -1;
      this.liked.emit(this.article.id);
    });
  }

  onBookmark(event: Event) {
    event.stopPropagation();
    this.educationService.toggleBookmark(this.article.id).subscribe(res => {
      this.article.isBookmarked = res.bookmarked;
      this.bookmarked.emit(this.article.id);
    });
  }

  openDetail() {
    this.router.navigate(['/patient/education/article', this.article.id]);
  }

  formatCount(count: number): string {
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count.toString();
  }

  getDifficultyColor(): string {
    const colors: Record<string, string> = {
      BEGINNER: '#22c55e',
      INTERMEDIATE: '#f59e0b',
      ADVANCED: '#ef4444'
    };
    return colors[this.article.difficultyLevel] || '#6b7280';
  }
}