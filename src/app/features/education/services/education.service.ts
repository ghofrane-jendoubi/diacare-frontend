import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContentSummary, ContentDetail, PageResponse } from '../models/content';
import { EducationComment } from '../models/comment';
import { AuthService } from '../../../shared/services/auth.service';

@Injectable({ providedIn: 'root' })
export class EducationService {

  private apiUrl = 'http://localhost:8090/api/education'; // ← change selon ton port

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

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

  getContentDetail(id: number): Observable<ContentDetail> {
    return this.http.get<ContentDetail>(
      `${this.apiUrl}/contents/${id}`);
  }

  toggleLike(id: number, userId?: number): Observable<{ liked: boolean }> {
    const resolvedUserId = userId ?? this.authService.currentUser?.id ?? 1;
    return this.http.post<{ liked: boolean }>(
      `${this.apiUrl}/contents/${id}/like?userId=${resolvedUserId}`, {});
  }

  toggleBookmark(id: number, userId?: number): Observable<{ bookmarked: boolean }> {
    const resolvedUserId = userId ?? this.authService.currentUser?.id ?? 1;
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

  // ← URL corrigée
  getMyBookmarks(userId?: number): Observable<ContentSummary[]> {
    const resolvedUserId = userId ?? this.authService.currentUser?.id ?? 1;
    return this.http.get<ContentSummary[]>(
      `${this.apiUrl}/my-bookmarks?userId=${resolvedUserId}`);
  }

  getComments(contentId: number): Observable<EducationComment[]> {
    return this.http.get<EducationComment[]>(
      `${this.apiUrl}/contents/${contentId}/comments`);
  }

  addComment(contentId: number, commentText: string,
             parentCommentId?: number,
             userName?: string): Observable<EducationComment> {
    const body: any = {
      commentText: commentText,
      userName: userName || this.authService.currentUser?.name || 'Patient DiaCare'
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
    return this.http.post<{ success: boolean }>(
      `${this.apiUrl}/contents/${contentId}/feedback`, payload
    );
  }
}
