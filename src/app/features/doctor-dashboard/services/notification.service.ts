import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id: number;
  doctorId: number;
  type: 'COMMENT' | 'MESSAGE';
  contentId?: number;
  commentId?: number;
  triggeredBy?: number;
  triggeredByName?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'http://localhost:8090/api/doctor/education';
  private doctorId = 1; // TODO: get from auth

  constructor(private http: HttpClient) { }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications/doctor/${this.doctorId}`);
  }

  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications/doctor/${this.doctorId}/unread`);
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/notifications/doctor/${this.doctorId}/unread-count`);
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/notifications/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/notifications/doctor/${this.doctorId}/read-all`, {});
  }
}