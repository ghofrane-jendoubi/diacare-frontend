import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DoctorStats, ArticleForm, PrivateMessage } from '../models/doctor-education.model';
import { ContentSummary } from '../../education/models/content';
import { EducationComment } from '../../education/models/comment';

@Injectable({ providedIn: 'root' })
export class DoctorEducationService {

  private apiUrl = 'http://localhost:8090/api/doctor/education';
  private doctorId = 1;
  private doctorName = 'Dr. Ahmed Ben Ali';

  constructor(private http: HttpClient) {}

  // ===== ARTICLES =====
  getDoctorArticles(): Observable<ContentSummary[]> {
    return this.http.get<ContentSummary[]>(
      `${this.apiUrl}/contents/doctor/${this.doctorId}`);
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
    return this.http.get<DoctorStats>(`${this.apiUrl}/stats/doctor/${this.doctorId}`);
  }

  // ===== COMMENTAIRES =====
  getDoctorComments(): Observable<EducationComment[]> {
    return this.http.get<EducationComment[]>(
      `${this.apiUrl}/comments/doctor/${this.doctorId}`);
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

  // ===== MESSAGES PRIVÉS =====
  getReceivedMessages(): Observable<PrivateMessage[]> {
    return this.http.get<PrivateMessage[]>(
      `${this.apiUrl}/messages/received/${this.doctorId}`);
  }

  sendPrivateMessage(receiverId: number, receiverName: string,
                     message: string, contentId?: number,
                     commentId?: number): Observable<PrivateMessage> {
    return this.http.post<PrivateMessage>(`${this.apiUrl}/messages/send`, {
      senderId: this.doctorId,
      senderName: this.doctorName,
      receiverId,
      receiverName,
      message,
      contentId,
      commentId
    });
  }

  markMessageAsRead(messageId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/messages/${messageId}/read`, {});
  }

  deleteMessage(messageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/messages/${messageId}`);
  }
}