import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EducationService } from '../../services/education.service';
import { ContentDetail, CATEGORY_LABELS, CATEGORY_ICONS, DIFFICULTY_LABELS } from '../../models/content';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.css']
})
export class ArticleDetailComponent implements OnInit {

  article: ContentDetail | null = null;
  isLoading = true;
  newComment = '';
  isSubmittingComment = false;
  categoryLabels = CATEGORY_LABELS;
  categoryIcons = CATEGORY_ICONS;
  difficultyLabels = DIFFICULTY_LABELS;

  constructor(
    private route: ActivatedRoute,
    private educationService: EducationService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.educationService.getContentDetail(id).subscribe(data => {
      this.article = data;
      this.isLoading = false;
    });
  }

  onLike() {
    if (!this.article) return;
    this.educationService.toggleLike(this.article.id).subscribe(res => {
      this.article!.isLiked = res.liked;
      this.article!.likeCount += res.liked ? 1 : -1;
    });
  }

  onBookmark() {
    if (!this.article) return;
    this.educationService.toggleBookmark(this.article.id).subscribe(res => {
      this.article!.isBookmarked = res.bookmarked;
    });
  }

  onShare() {
    if (navigator.share) {
      navigator.share({
        title: this.article?.title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papier !');
    }
  }

  submitComment() {
    if (!this.newComment.trim() || !this.article) return;
    this.isSubmittingComment = true;
    this.educationService.addComment(this.article.id, this.newComment).subscribe(comment => {
      if (!this.article!.comments) this.article!.comments = [];
      this.article!.comments.unshift(comment);
      this.article!.commentCount++;
      this.newComment = '';
      this.isSubmittingComment = false;
    });
  }

  formatCount(count: number): string {
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count.toString();
  }
}