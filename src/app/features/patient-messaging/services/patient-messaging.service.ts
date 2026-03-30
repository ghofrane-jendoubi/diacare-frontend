import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PrivateMessage, MessageResponse } from '../models/patient-messaging.model';

@Injectable({
  providedIn: 'root'
})
export class PatientMessagingService {
  private patientApiUrl = 'http://localhost:8090/api/patient';

  constructor(private http: HttpClient) {}

  // Récupérer tous les messages (envoyés + reçus)
  getAllMessages(userId: number): Observable<MessageResponse> {
    return this.http.get<MessageResponse>(`${this.patientApiUrl}/messages/${userId}`);
  }

  // Récupérer les messages envoyés
  getSentMessages(userId: number): Observable<PrivateMessage[]> {
    return this.http.get<PrivateMessage[]>(`${this.patientApiUrl}/messages/sent/${userId}`);
  }

  // Récupérer les messages reçus
  getReceivedMessages(userId: number): Observable<PrivateMessage[]> {
    return this.http.get<PrivateMessage[]>(`${this.patientApiUrl}/messages/received/${userId}`);
  }

  // Envoyer un message
  sendMessage(
    receiverId: number,
    receiverName: string,
    message: string,
    contentId?: number,
    commentId?: number
  ): Observable<PrivateMessage> {
    const senderId = 1; // ID du patient actuel
    const senderName = 'Patient DiaCare';

    return this.http.post<PrivateMessage>(`${this.patientApiUrl}/messages/send`, {
      senderId,
      senderName,
      receiverId,
      receiverName,
      message,
      contentId,
      commentId
    });
  }

  // Marquer un message comme lu
  markMessageAsRead(messageId: number): Observable<void> {
    return this.http.patch<void>(`${this.patientApiUrl}/messages/${messageId}/read`, {});
  }

  deleteMessage(messageId: number): Observable<void> {
    return this.http.delete<void>(`${this.patientApiUrl}/messages/${messageId}`);
  }
}
