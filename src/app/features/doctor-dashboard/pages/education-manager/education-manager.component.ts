import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DoctorEducationService } from '../../services/doctor-education.service';
import { PatientFeedbackService } from '../../services/patient-feedback.service';
import { DoctorStats } from '../../models/doctor-education.model';
import { ContentSummary } from '../../../education/models/content';
import { PatientFeedback } from '../../models/patient-feedback.model';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-education-manager',
  templateUrl: './education-manager.component.html',
  styleUrls: ['./education-manager.component.css']
})
export class EducationManagerComponent implements OnInit {

  stats: DoctorStats = {
    totalArticles: 0, totalViews: 0,
    totalLikes: 0, totalComments: 0
  };
  articles: ContentSummary[] = [];
  feedbacks: PatientFeedback[] = [];
  feedbacksByContent: Record<number, PatientFeedback[]> = {};
  isLoading = true;
  isFeedbackLoading = true;
  activeTab = 'articles';

  constructor(
    private doctorService: DoctorEducationService,
    private feedbackService: PatientFeedbackService,
    private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.loadStats();
    this.loadArticles();
    this.loadFeedbacks();
  }

  loadStats() {
    this.doctorService.getDoctorStats().subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error('Erreur stats:', err)
    });
  }

  loadArticles() {
    this.isLoading = true;
    this.doctorService.getDoctorArticles().subscribe({
      next: (data) => {
        this.articles = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur articles:', err);
        this.isLoading = false;
      }
    });
  }

  loadFeedbacks() {
    this.isFeedbackLoading = true;
    this.feedbackService.getPatientFeedbacks().subscribe({
      next: (data) => {
        this.feedbacks = data;
        this.feedbacksByContent = data.reduce((acc, feedback) => {
          if (!acc[feedback.contentId]) {
            acc[feedback.contentId] = [];
          }
          acc[feedback.contentId].push(feedback);
          return acc;
        }, {} as Record<number, PatientFeedback[]>);
        this.isFeedbackLoading = false;
      },
      error: (err) => {
        console.error('Erreur feedbacks:', err);
        this.feedbacks = [];
        this.feedbacksByContent = {};
        this.isFeedbackLoading = false;
      }
    });
  }

  newArticle() {
    this.router.navigate(['/doctor/education/new']);
  }

  editArticle(id: number) {
    this.router.navigate(['/doctor/education/edit', id]);
  }

  deleteArticle(id: number) {
    if (confirm('Supprimer cet article définitivement ?')) {
      this.doctorService.deleteArticle(id).subscribe(() => {
        this.articles = this.articles.filter(a => a.id !== id);
        this.stats.totalArticles--;
      });
    }
  }

  togglePublish(article: ContentSummary) {
    this.doctorService.togglePublish(article.id).subscribe(res => {
      article.isPublished = res.isPublished;
    });
  }

  getFeedbacksForArticle(articleId: number): PatientFeedback[] {
    return this.feedbacksByContent[articleId] ?? [];
  }

  getEmotionLabel(emotion: string): string {
    switch (emotion) {
      case 'HAPPY': return 'Content';
      case 'SAD': return 'Triste / anxieux';
      default: return 'Neutre';
    }
  }

  getEmotionIcon(emotion: string): string {
    switch (emotion) {
      case 'HAPPY': return '😀';
      case 'SAD': return '😟';
      default: return '😐';
    }
  }

  formatCount(count: number): string {
    if (!count) return '0';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count.toString();
  }

  get currentUserName(): string {
    return this.auth.currentUser?.name || '';
  }

  get currentUserFirstName(): string {
    return this.auth.currentUser?.name?.split(' ')[0] || '';
  }
}
