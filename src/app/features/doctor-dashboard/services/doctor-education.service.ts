import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DoctorStats, ArticleForm } from '../models/doctor-education.model';
import { ContentSummary } from '../../education/models/content';
import { EducationComment } from '../../education/models/comment';
import { AuthService } from '../../../shared/services/auth.service';

@Injectable({ providedIn: 'root' })
export class DoctorEducationService {

  private apiUrl = 'http://localhost:8090/api/doctor/education';
  private doctorName = 'Dr. Ahmed Ben Ali';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private get doctorId(): number {
    const user = this.auth.currentUser;
    if (!user || user.role !== 'DOCTOR' || !user.id) {
      return 1;
    }
    return user.id;
  }

  // ===== ARTICLES =====
  getDoctorArticles(): Observable<ContentSummary[]> {
    const primaryDoctorId = this.doctorId;
    return this.http.get<ContentSummary[]>(
      `${this.apiUrl}/contents/doctor/${primaryDoctorId}`).pipe(
      switchMap((articles) => {
        if (articles.length > 0 || primaryDoctorId === 1) {
          return of(articles);
        }
        return this.http.get<ContentSummary[]>(
          `${this.apiUrl}/contents/doctor/1`);
      })
    );
  }

  createArticle(form: ArticleForm): Observable<ContentSummary> {
    return this.http.post<ContentSummary>(
      `${this.apiUrl}/contents?doctorId=${this.doctorId}&doctorName=${this.doctorName}`,
      form);
  }

  updateArticle(id: number, form: Partial<ArticleForm>): Observable<ContentSummary> {
    return this.http.put<ContentSummary>(`${this.apiUrl}/contents/${id}`, form);
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/contents/${id}`);
  }

  togglePublish(id: number): Observable<{ isPublished: boolean }> {
    return this.http.patch<{ isPublished: boolean }>(
      `${this.apiUrl}/contents/${id}/toggle-publish`, {});
  }

  // ===== STATISTIQUES =====
  getDoctorStats(): Observable<DoctorStats> {
    const primaryDoctorId = this.doctorId;
    return this.http.get<DoctorStats>(`${this.apiUrl}/stats/doctor/${primaryDoctorId}`).pipe(
      switchMap((stats) => {
        if (stats.totalArticles > 0 || primaryDoctorId === 1) {
          return of(stats);
        }
        return this.http.get<DoctorStats>(`${this.apiUrl}/stats/doctor/1`);
      })
    );
  }

  // ===== COMMENTAIRES =====
  getDoctorComments(): Observable<EducationComment[]> {
    const primaryDoctorId = this.doctorId;
    return this.http.get<EducationComment[]>(
      `${this.apiUrl}/comments/doctor/${primaryDoctorId}`).pipe(
      switchMap((comments) => {
        if (comments.length > 0 || primaryDoctorId === 1) {
          return of(comments);
        }
        return this.http.get<EducationComment[]>(
          `${this.apiUrl}/comments/doctor/1`);
      })
    );
  }

  replyToComment(commentId: number, replyText: string): Observable<EducationComment> {
    return this.http.post<EducationComment>(
      `${this.apiUrl}/comments/${commentId}/reply`, {
        doctorId: this.doctorId,
        doctorName: this.doctorName,
        replyText
      });
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`);
  }
}
