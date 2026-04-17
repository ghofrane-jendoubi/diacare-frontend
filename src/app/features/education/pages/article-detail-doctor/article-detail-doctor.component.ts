import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EducationService } from '../../services/education.service';
import { ContentSummary } from '../../models/content';

@Component({
  selector: 'app-article-detail-doctor',
  templateUrl: './article-detail-doctor.component.html',
  styleUrls: ['./article-detail.component.css']
})
export class ArticleDetailDoctorComponent implements OnInit {
  content: ContentSummary | null = null;
  isLoading = true;
  contentId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private educationService: EducationService
  ) {}

  ngOnInit(): void {
    this.contentId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadContent();
  }

  loadContent(): void {
    this.isLoading = true;
    this.educationService.getContentDetail(this.contentId).subscribe({
      next: (data) => {
        this.content = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  toggleLike(): void {
    if (this.content) {
      this.educationService.toggleLike(this.content.id).subscribe(() => {
        if (this.content) {
          this.content.isLiked = !this.content.isLiked;
          this.content.likeCount += this.content.isLiked ? 1 : -1;
        }
      });
    }
  }

  toggleBookmark(): void {
    if (this.content) {
      this.educationService.toggleBookmark(this.content.id).subscribe(() => {
        if (this.content) {
          this.content.isBookmarked = !this.content.isBookmarked;
        }
      });
    }
  }

  getDifficultyColor(difficulty: string): string {
    const colors = {
      'BEGINNER': '#28a745',
      'INTERMEDIATE': '#ffc107', 
      'ADVANCED': '#dc3545'
    };
    return colors[difficulty as keyof typeof colors] || '#6c757d';
  }

  getCategoryIcon(category: string): string {
    const icons = {
      'NUTRITION': 'bi-apple',
      'EXERCISE': 'bi-bicycle',
      'MEDICATION': 'bi-capsule',
      'MONITORING': 'bi-activity',
      'PREVENTION': 'bi-shield-check',
      'COMPLICATIONS': 'bi-exclamation-triangle',
      'MENTAL_HEALTH': 'bi-heart',
      'RESEARCH': 'bi-microscope'
    };
    return icons[category as keyof typeof icons] || 'bi-file-text';
  }
}
