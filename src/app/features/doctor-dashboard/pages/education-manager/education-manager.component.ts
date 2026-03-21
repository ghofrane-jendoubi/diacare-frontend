import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DoctorEducationService } from '../../services/doctor-education.service';
import { DoctorStats } from '../../models/doctor-education.model';
import { ContentSummary } from '../../../education/models/content';

@Component({
  selector: 'app-education-manager',
  templateUrl: './education-manager.component.html',
  styleUrls: ['./education-manager.component.css']
})
export class EducationManagerComponent implements OnInit {

  stats: DoctorStats = {
    totalArticles: 0, totalViews: 0,
    totalLikes: 0, totalComments: 0, unreadMessages: 0
  };
  articles: ContentSummary[] = [];
  isLoading = true;
  activeTab = 'articles';

  constructor(
    private doctorService: DoctorEducationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStats();
    this.loadArticles();
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

  formatCount(count: number): string {
    if (!count) return '0';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count.toString();
  }
}