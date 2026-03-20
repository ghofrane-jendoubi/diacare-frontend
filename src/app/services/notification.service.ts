import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8081/api/notifications';

  constructor(private http: HttpClient) { }

  
  sendNotification(userId: number, title: string, message: string, link: string): Observable<any> {
    return this.http.post(this.apiUrl, { userId, title, message, link });
  }
  // Récupérer toutes les notifications d'un utilisateur (pas seulement les non lues)
getUserNotifications(userId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
}

  // Récupérer les notifications non lues
  getUnreadNotifications(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}/unread`);
  }

  // Récupérer le nombre de notifications non lues
  getUnreadCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/user/${userId}/count`);
  }

  // Marquer une notification comme lue
  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${notificationId}/read`, {});
  }

  // Marquer toutes les notifications comme lues
  markAllAsRead(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/${userId}/read-all`, {});
  }

  // Polling toutes les 30 secondes pour les nouvelles notifications
  startPolling(userId: number): Observable<any> {
    return interval(30000).pipe(
      switchMap(() => this.getUnreadCount(userId))
    );
  }
}