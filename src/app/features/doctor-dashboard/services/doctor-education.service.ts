import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DoctorStats, ArticleForm } from '../models/doctor-education.model';
import { ContentSummary } from '../../education/models/content';
import { EducationComment } from '../../education/models/comment';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class DoctorEducationService {
  private apiUrl = 'http://localhost:8081/api/doctor/education';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  // ✅ ID du docteur connecté
  private getDoctorId(): Observable<number> {
    return this.auth.currentUser$.pipe(
      map(user => {
        if (!user?.id) throw new Error('Aucun docteur connecté');
        return user.id;
      })
    );
  }

  // ✅ Nom complet du docteur connecté
  private getDoctorName(): string {
    const user = this.auth.getCurrentUser();
    if (!user) return 'Docteur';
    return `Dr. ${user.firstName} ${user.lastName}`;
  }

  // ===== ARTICLES =====

  getDoctorArticles(): Observable<ContentSummary[]> {
    return this.getDoctorId().pipe(
      switchMap(doctorId =>
        this.http.get<ContentSummary[]>(`${this.apiUrl}/contents/doctor/${doctorId}`)
      )
    );
  }

  createArticle(form: ArticleForm): Observable<ContentSummary> {
    return this.getDoctorId().pipe(
      switchMap(doctorId =>
        this.http.post<ContentSummary>(
          `${this.apiUrl}/contents?doctorId=${doctorId}&doctorName=${encodeURIComponent(this.getDoctorName())}`,
          form
        )
      )
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
    return this.getDoctorId().pipe(
      switchMap(doctorId =>
        this.http.get<DoctorStats>(`${this.apiUrl}/stats/doctor/${doctorId}`)
      )
    );
  }

  // ===== COMMENTAIRES =====

  getDoctorComments(): Observable<EducationComment[]> {
    return this.getDoctorId().pipe(
      switchMap(doctorId =>
        this.http.get<EducationComment[]>(`${this.apiUrl}/comments/doctor/${doctorId}`)
      )
    );
  }

  replyToComment(commentId: number, replyText: string): Observable<EducationComment> {
    return this.getDoctorId().pipe(
      switchMap(doctorId =>
        this.http.post<EducationComment>(`${this.apiUrl}/comments/${commentId}/reply`, {
          doctorId,
          doctorName: this.getDoctorName(),
          replyText
        })
      )
    );
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`);
  }
}