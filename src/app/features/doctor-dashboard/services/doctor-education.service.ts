// doctor-education.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DoctorStats, ArticleForm } from '../models/doctor-education.model';
import { ContentSummary } from '../../education/models/content';
import { EducationComment } from '../../education/models/comment';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class DoctorEducationService {

  private apiUrl = 'http://localhost:8081/api/doctor/education';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ✅ Récupérer l'ID du docteur depuis localStorage directement
  private get doctorId(): number {
    // Essayer plusieurs sources
    let doctorId = localStorage.getItem('doctor_id');
    
    if (!doctorId) {
      const user = this.authService.getCurrentUser();
      if (user && user.id) {
        doctorId = user.id.toString();
      }
    }
    
    if (!doctorId) {
      console.error('❌ Aucun docteur connecté - doctor_id non trouvé');
      return 0;
    }
    
    return parseInt(doctorId);
  }

  private get doctorName(): string {
    const firstName = localStorage.getItem('doctor_firstName');
    const lastName = localStorage.getItem('doctor_lastName');
    
    if (firstName && lastName) {
      return `Dr. ${firstName} ${lastName}`;
    }
    
    const user = this.authService.getCurrentUser();
    if (user && user.firstName && user.lastName) {
      return `Dr. ${user.firstName} ${user.lastName}`;
    }
    
    return 'Dr. Médecin';
  }

  // ===== ARTICLES =====
  getDoctorArticles(): Observable<ContentSummary[]> {
    const id = this.doctorId;
    if (!id) {
      console.error('❌ Impossible de charger les articles: docteur non identifié');
      return of([]);
    }
    return this.http.get<ContentSummary[]>(`${this.apiUrl}/contents/doctor/${id}`);
  }

  createArticle(form: ArticleForm): Observable<ContentSummary> {
    const id = this.doctorId;
    if (!id) {
      throw new Error('Docteur non identifié');
    }
    return this.http.post<ContentSummary>(
      `${this.apiUrl}/contents?doctorId=${id}&doctorName=${encodeURIComponent(this.doctorName)}`,
      form
    );
  }

  updateArticle(id: number, form: Partial<ArticleForm>): Observable<ContentSummary> {
    return this.http.put<ContentSummary>(`${this.apiUrl}/contents/${id}`, form);
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/contents/${id}`);
  }

  togglePublish(id: number): Observable<{ isPublished: boolean }> {
    return this.http.patch<{ isPublished: boolean }>(
      `${this.apiUrl}/contents/${id}/toggle-publish`, {}
    );
  }

  // ===== STATISTIQUES =====
  getDoctorStats(): Observable<DoctorStats> {
    const id = this.doctorId;
    if (!id) {
      console.error('❌ Impossible de charger les stats: docteur non identifié');
      return of({ totalArticles: 0, totalViews: 0, totalLikes: 0, totalComments: 0 });
    }
    return this.http.get<DoctorStats>(`${this.apiUrl}/stats/doctor/${id}`);
  }

  // ===== COMMENTAIRES =====
  getDoctorComments(): Observable<EducationComment[]> {
    const id = this.doctorId;
    if (!id) {
      return of([]);
    }
    return this.http.get<EducationComment[]>(`${this.apiUrl}/comments/doctor/${id}`);
  }

  replyToComment(commentId: number, replyText: string): Observable<EducationComment> {
    const id = this.doctorId;
    if (!id) {
      throw new Error('Docteur non identifié');
    }
    return this.http.post<EducationComment>(`${this.apiUrl}/comments/${commentId}/reply`, {
      doctorId: id,
      doctorName: this.doctorName,
      replyText
    });
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`);
  }
}