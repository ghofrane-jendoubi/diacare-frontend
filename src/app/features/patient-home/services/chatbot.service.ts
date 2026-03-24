import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  sender: 'PATIENT' | 'BOT';
  message: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {

  private apiUrl = 'http://localhost:8090/api/chatbot';
  private sessionId: string;

  constructor(private http: HttpClient) {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  sendMessage(message: string, patientId = 1): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat`, {
      sessionId: this.sessionId,
      message,
      patientId
    });
  }

  getHistory(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/history/${this.sessionId}`);
  }

  getSessionId(): string { return this.sessionId; }
}