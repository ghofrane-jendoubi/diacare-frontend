import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContentSummary, ContentDetail, PageResponse } from '../models/content';
import { EducationComment } from '../models/comment';

@Injectable({ providedIn: 'root' })
export class EducationService {

  private apiUrl = 'http://localhost:8090/api/education';

  constructor(private http: HttpClient) {}

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

  toggleLike(id: number, userId: number = 1): Observable<{ liked: boolean }> {
    return this.http.post<{ liked: boolean }>(
      `${this.apiUrl}/contents/${id}/like?userId=${userId}`, {});
  }

  toggleBookmark(id: number, userId: number = 1): Observable<{ bookmarked: boolean }> {
    return this.http.post<{ bookmarked: boolean }>(
      `${this.apiUrl}/contents/${id}/bookmark?userId=${userId}`, {});
  }

  getFeatured(): Observable<ContentSummary[]> {
    return this.http.get<ContentSummary[]>(
      `${this.apiUrl}/contents/featured`);
  }

  getMostViewed(): Observable<ContentSummary[]> {
    return this.http.get<ContentSummary[]>(
      `${this.apiUrl}/contents/most-viewed`);
  }

  // ← URL corrigée
  getMyBookmarks(userId: number = 1): Observable<ContentSummary[]> {
    return this.http.get<ContentSummary[]>(
      `${this.apiUrl}/my-bookmarks?userId=${userId}`);
  }

  getComments(contentId: number): Observable<EducationComment[]> {
    return this.http.get<EducationComment[]>(
      `${this.apiUrl}/contents/${contentId}/comments`);
  }

  addComment(contentId: number, commentText: string,
             parentCommentId?: number): Observable<EducationComment> {
    return this.http.post<EducationComment>(
      `${this.apiUrl}/contents/${contentId}/comments`, {
        commentText: commentText,
        parentCommentId: parentCommentId,
        userName: 'Patient DiaCare'
      });
  }
}