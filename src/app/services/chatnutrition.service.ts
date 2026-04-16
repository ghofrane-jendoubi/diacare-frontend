// chatnutrition.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessage } from '../models/diet-plan.model';

@Injectable({ providedIn: 'root' })
export class ChatNutritionService {

  private apiUrl = 'http://localhost:8081/api/message';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = (typeof window !== 'undefined')
      ? localStorage.getItem('token') || '' : '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ── API ───────────────────────────────────────────────────

  getConversation(patientId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.apiUrl}/conversation/${patientId}`,
      { headers: this.getHeaders() }
    );
  }

  sendMessage(msg: Omit<ChatMessage, 'id' | 'isRead' | 'createdAt'>): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(
      `${this.apiUrl}/send`, msg,
      { headers: this.getHeaders() }
    );
  }

  markAsRead(patientId: number, userId: number): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/read/${patientId}/${userId}`, {},
      { headers: this.getHeaders() }
    );
  }

  countUnread(receiverId: number): Observable<number> {
    return this.http.get<number>(
      `${this.apiUrl}/unread/${receiverId}`,
      { headers: this.getHeaders() }
    );
  }
  getPatientInfo(patientId: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/patients/${patientId}`);
}
}