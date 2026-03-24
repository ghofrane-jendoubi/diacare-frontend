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
    this.educationService.getContentDetail(id).subscribe({
      next: (data) => {
        this.article = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement article:', err);
        this.isLoading = false;
      }
    });
  }

  // ===== YOUTUBE =====
  isYoutubeUrl(url: string): boolean {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  getYoutubeEmbedUrl(url: string): string {
    if (!url) return '';
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  }

  // ===== ACTIONS =====
  onLike() {
    if (!this.article) return;
    this.educationService.toggleLike(this.article.id).subscribe({
      next: (res) => {
        this.article!.isLiked = res.liked;
        this.article!.likeCount += res.liked ? 1 : -1;
      },
      error: (err) => console.error('Erreur like:', err)
    });
  }

  onBookmark() {
    if (!this.article) return;
    this.educationService.toggleBookmark(this.article.id).subscribe({
      next: (res) => {
        this.article!.isBookmarked = res.bookmarked;
        const msg = res.bookmarked
          ? '✅ Article sauvegardé !'
          : '🗑️ Article retiré des favoris';
        this.showToast(msg);
      },
      error: (err) => console.error('Erreur bookmark:', err)
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
      this.showToast('🔗 Lien copié dans le presse-papier !');
    }
  }

  submitComment() {
    if (!this.newComment.trim() || !this.article) return;
    this.isSubmittingComment = true;
    this.educationService.addComment(this.article.id, this.newComment).subscribe({
      next: (comment) => {
        if (!this.article!.comments) this.article!.comments = [];
        this.article!.comments.unshift(comment);
        this.article!.commentCount++;
        this.newComment = '';
        this.isSubmittingComment = false;
      },
      error: (err) => {
        console.error('Erreur commentaire:', err);
        this.isSubmittingComment = false;
      }
    });
  }

  formatCount(count: number): string {
    if (!count) return '0';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count.toString();
  }

  showToast(message: string) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; bottom: 28px; right: 28px;
      background: #1e293b; color: white;
      padding: 12px 20px; border-radius: 10px;
      font-size: 14px; font-weight: 500;
      z-index: 99999; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2500);
  }
}