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

  getAllContents(page = 0, size = 9): Observable<PageResponse<ContentSummary>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<ContentSummary>>(`${this.apiUrl}/contents`, { params });
  }

  getByCategory(category: string, page = 0, size = 9): Observable<PageResponse<ContentSummary>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<ContentSummary>>(
      `${this.apiUrl}/contents/category/${category}`, { params });
  }

  search(keyword: string, page = 0, size = 9): Observable<PageResponse<ContentSummary>> {
    const params = new HttpParams().set('keyword', keyword).set('page', page).set('size', size);
    return this.http.get<PageResponse<ContentSummary>>(`${this.apiUrl}/contents/search`, { params });
  }

  getContentDetail(id: number): Observable<ContentDetail> {
    return this.http.get<ContentDetail>(`${this.apiUrl}/contents/${id}`);
  }

  toggleLike(id: number): Observable<{ liked: boolean }> {
    return this.http.post<{ liked: boolean }>(`${this.apiUrl}/contents/${id}/like`, {});
  }

  toggleBookmark(id: number): Observable<{ bookmarked: boolean }> {
    return this.http.post<{ bookmarked: boolean }>(`${this.apiUrl}/contents/${id}/bookmark`, {});
  }

  getFeatured(): Observable<ContentSummary[]> {
    return this.http.get<ContentSummary[]>(`${this.apiUrl}/contents/featured`);
  }

  getMostViewed(): Observable<ContentSummary[]> {
    return this.http.get<ContentSummary[]>(`${this.apiUrl}/contents/most-viewed`);
  }

  getMyBookmarks(): Observable<ContentSummary[]> {
    return this.http.get<ContentSummary[]>(`${this.apiUrl}/my-bookmarks`);
  }

  getComments(contentId: number): Observable<EducationComment[]> {
    return this.http.get<EducationComment[]>(`${this.apiUrl}/contents/${contentId}/comments`);
  }

  addComment(contentId: number, commentText: string, parentCommentId?: number, userName?: string): Observable<EducationComment> {
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
}