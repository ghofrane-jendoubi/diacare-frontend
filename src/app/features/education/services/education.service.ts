import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { ContentSummary, ContentDetail, PageResponse } from '../models/content';
import { EducationComment } from '../models/comment';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class EducationService {

  private apiUrl = 'http://localhost:8081/api/education';
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Helper pour récupérer l'ID utilisateur
  private getUserId(): number {
    const user = this.authService.getCurrentUser();
    return user?.id || 1;
  }

  // Helper pour récupérer le nom utilisateur
  private getUserName(): string {
    const user = this.authService.getCurrentUser();
    if (user) {
      return `${user.firstName} ${user.lastName}`.trim();
    }
    return 'Patient DiaCare';
  }

  getAllContents(page: number = 0, size: number = 9): Observable<PageResponse<ContentSummary>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));
    return this.http.get<PageResponse<ContentSummary>>(
      `${this.apiUrl}/contents`, { params });
  }

  getByCategory(category: string, page: number = 0, size: number = 9): Observable<PageResponse<ContentSummary>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));
    return this.http.get<PageResponse<ContentSummary>>(
      `${this.apiUrl}/contents/category/${category}`, { params });
  }

  search(keyword: string, page: number = 0, size: number = 9): Observable<PageResponse<ContentSummary>> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', String(page))
      .set('size', String(size));
    return this.http.get<PageResponse<ContentSummary>>(
      `${this.apiUrl}/contents/search`, { params });
  }

  // education.service.ts
getContentDetail(id: number): Observable<ContentDetail> {
  return this.http.get<ContentDetail>(`${this.apiUrl}/contents/${id}`).pipe(
    map(article => {
      // Si authorName est vide ou null, essayer de le récupérer
      if (!article.authorName && article.authorId) {
        this.getDoctorName(article.authorId).subscribe(name => {
          article.authorName = name;
        });
      }
      return article;
    })
  );
}

private getDoctorName(doctorId: number): Observable<string> {
  return this.http.get<{ name: string }>(`${this.apiUrl}/doctors/${doctorId}/name`).pipe(
    map(res => res.name),
    catchError(() => of('Médecin'))
  );
}

  // ✅ Corrigé : utiliser getUserId()
  toggleLike(id: number, userId?: number): Observable<{ liked: boolean }> {
    const resolvedUserId = userId ?? this.getUserId();
    return this.http.post<{ liked: boolean }>(
      `${this.apiUrl}/contents/${id}/like?userId=${resolvedUserId}`, {});
  }

  // ✅ Corrigé : utiliser getUserId()
  toggleBookmark(id: number, userId?: number): Observable<{ bookmarked: boolean }> {
    const resolvedUserId = userId ?? this.getUserId();
    return this.http.post<{ bookmarked: boolean }>(
      `${this.apiUrl}/contents/${id}/bookmark?userId=${resolvedUserId}`, {});
  }

  getFeatured(): Observable<ContentSummary[]> {
    return this.http.get<ContentSummary[]>(
      `${this.apiUrl}/contents/featured`);
  }

  getMostViewed(): Observable<ContentSummary[]> {
    return this.http.get<ContentSummary[]>(
      `${this.apiUrl}/contents/most-viewed`);
  }

  getRecommendations(userId?: number, diabetesType?: string): Observable<ContentSummary[]> {
    let params = new HttpParams();

    if (userId !== undefined && userId !== null) {
      params = params.set('userId', String(userId));
    }

    if (diabetesType) {
      params = params.set('diabetesType', diabetesType);
    }

    return this.http.get<ContentSummary[]>(
      `${this.apiUrl}/recommendations`, { params });
  }

  // ✅ Corrigé : utiliser getUserId()
  getMyBookmarks(userId?: number): Observable<ContentSummary[]> {
    const resolvedUserId = userId ?? this.getUserId();
    return this.http.get<ContentSummary[]>(
      `${this.apiUrl}/my-bookmarks?userId=${resolvedUserId}`);
  }

  getComments(contentId: number): Observable<EducationComment[]> {
    return this.http.get<EducationComment[]>(
      `${this.apiUrl}/contents/${contentId}/comments`);
  }

  // ✅ Corrigé : utiliser getUserName()
  addComment(contentId: number, commentText: string,
             parentCommentId?: number,
             userName?: string): Observable<EducationComment> {
    const body: any = {
      commentText: commentText,
      userName: userName || this.getUserName()
    };

    if (parentCommentId) {
      body.parentCommentId = parentCommentId;
    }

    return this.http.post<EducationComment>(
      `${this.apiUrl}/contents/${contentId}/comments`, body
    );
  }

  submitContentFeedback(contentId: number, payload: {
    userId?: number;
    emotion: string;
    commentaire?: string;
  }): Observable<{ success: boolean }> {
    // Ajouter l'userId si non fourni
    const finalPayload = {
      ...payload,
      userId: payload.userId ?? this.getUserId()
    };
    return this.http.post<{ success: boolean }>(
      `${this.apiUrl}/contents/${contentId}/feedback`, finalPayload
    );
  }
}