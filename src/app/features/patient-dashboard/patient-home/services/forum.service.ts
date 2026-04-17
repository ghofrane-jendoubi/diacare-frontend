import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ForumPost {
  id: number;
  patientId: number;
  patientName: string;
  title: string;
  content: string;
  category: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isModerated: boolean;
  isFlagged: boolean;
  moderationReason: string;
  isLiked?: boolean;
}

export interface ForumComment {
  id: number;
  postId: number;
  patientId: number;
  patientName: string;
  content: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ForumService {

 private apiUrl = 'http://localhost:8081/api/forum';
  constructor(private http: HttpClient) {}

  getPosts(page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));
    return this.http.get(`${this.apiUrl}/posts`, { params });
  }

  getPostsByCategory(category: string, page = 0): Observable<any> {
    const params = new HttpParams().set('page', String(page)).set('size', '10');
    return this.http.get(`${this.apiUrl}/posts/category/${category}`, { params });
  }

  getMyPosts(patientId: number): Observable<ForumPost[]> {
    return this.http.get<ForumPost[]>(`${this.apiUrl}/posts/my/${patientId}`);
  }

  createPost(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts`, data);
  }

  deletePost(postId: number, patientId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/posts/${postId}?patientId=${patientId}`);
  }

  toggleLike(postId: number, patientId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/posts/${postId}/like?patientId=${patientId}`, {});
  }

  getComments(postId: number): Observable<ForumComment[]> {
    return this.http.get<ForumComment[]>(`${this.apiUrl}/posts/${postId}/comments`);
  }

  addComment(postId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts/${postId}/comments`, data);
  }
}