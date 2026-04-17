import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ForumPost,
  ForumComment,
  TopPost,
  TopContributor,
  CategoryCount
} from './forum.model';

@Injectable({ providedIn: 'root' })
export class ForumService {

 private baseUrl = 'http://localhost:8081/api/forum';
  constructor(private http: HttpClient) {}

  getPosts(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/posts?page=${page}&size=${size}`);
  }

  getPostsByCategory(category: string, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/posts/category/${category}?page=${page}&size=${size}`);
  }

  getPostById(id: number): Observable<ForumPost> {
    return this.http.get<ForumPost>(`${this.baseUrl}/posts/${id}`);
  }

  createPost(post: Partial<ForumPost>): Observable<any> {
    return this.http.post(`${this.baseUrl}/posts`, post);
  }

  deletePost(postId: number, patientId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/posts/${postId}?patientId=${patientId}`);
  }

  toggleLike(postId: number, patientId: number): Observable<{ liked: boolean }> {
    return this.http.post<{ liked: boolean }>(`${this.baseUrl}/posts/${postId}/like?patientId=${patientId}`, {});
  }

  getComments(postId: number): Observable<ForumComment[]> {
    return this.http.get<ForumComment[]>(`${this.baseUrl}/posts/${postId}/comments`);
  }

  addComment(postId: number, comment: { content: string; patientId: number; patientName: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/posts/${postId}/comments`, comment);
  }

  getTopLikedPosts(limit: number = 5): Observable<TopPost[]> {
    return this.http.get<TopPost[]>(`${this.baseUrl}/stats/top-liked?limit=${limit}`);
  }

  getTopContributors(limit: number = 5): Observable<TopContributor[]> {
    return this.http.get<TopContributor[]>(`${this.baseUrl}/stats/top-contributors?limit=${limit}`);
  }

  getCategoryCounts(): Observable<CategoryCount[]> {
    return this.http.get<CategoryCount[]>(`${this.baseUrl}/stats/category-counts`);
  }
  searchPosts(keyword: string, page: number = 0, size: number = 10): Observable<any> {
  return this.http.get(`${this.baseUrl}/posts/search?keyword=${keyword}&page=${page}&size=${size}`);
}


}