import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'http://localhost:8081/api/messages';

  constructor(private http: HttpClient) { }

  sendMessage(senderId: number, receiverId: number, content: string, imageUrl?: string, audioUrl?: string, audioDuration?: number): Observable<any> {
    const payload: any = { senderId, receiverId, content };
    if (imageUrl) payload.imageUrl = imageUrl;
    if (audioUrl) {
      payload.audioUrl = audioUrl;
      payload.audioDuration = audioDuration;
    }
    return this.http.post(`${this.apiUrl}/send`, payload);
  }

  getConversation(userId1: number, userId2: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversation?userId1=${userId1}&userId2=${userId2}`);
  }

  markAsRead(receiverId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-read?receiverId=${receiverId}`, {});
  }
  getPatientConversations(patientId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/conversations/patient/${patientId}`);
}
}