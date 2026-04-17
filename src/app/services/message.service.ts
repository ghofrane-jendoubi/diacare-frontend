import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface SendMessageRequest {
  senderId: number;
  receiverId: number;
  content: string;
  imageUrl?: string;
  documentUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
}

export interface Message {
  id: number;
  sender: { id: number; firstName: string; lastName: string; profilePicture?: string };
  receiver: { id: number };
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  documentUrl?: string;
  delivered: boolean;
  seen: boolean;
  sentAt: string;
}

// ✅ Interface pour les conversations du patient (liste des médecins)
export interface DoctorConversationDTO {
  doctorId: number;
  doctorName: string;
  doctorProfilePicture?: string | null;
  speciality: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageSender?: number;
  unreadCount: number;
 
}

// ✅ Interface pour les conversations du médecin (liste des patients)
export interface PatientConversationDTO {
  patientId: number;
  patientName: string;
  patientProfilePicture: string;
  diabetesType: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageSender: number;
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'http://localhost:8081/api/messages';

  constructor(private http: HttpClient) { }

  // Récupérer la conversation entre deux utilisateurs
  getConversation(userId1: number, userId2: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/conversation?userId1=${userId1}&userId2=${userId2}`);
  }

  // Envoyer un message
  sendMessage(request: SendMessageRequest): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/send`, request);
  }

  // Marquer les messages comme lus (pour un utilisateur)
  markAsRead(receiverId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/mark-read?receiverId=${receiverId}`, {});
  }

  // Marquer les messages comme lus entre un médecin et un patient spécifique
  markMessagesAsRead(doctorId: number, patientId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/mark-read-between?doctorId=${doctorId}&patientId=${patientId}`, {});
  }

  // ✅ Récupérer les conversations d'un patient (liste des médecins)
  getPatientConversations(patientId: number): Observable<DoctorConversationDTO[]> {
    return this.http.get<DoctorConversationDTO[]>(`${this.apiUrl}/conversations/patient/${patientId}`);
  }

  // ✅ Récupérer les conversations d'un médecin (liste des patients)
  // message.service.ts - getDoctorConversations()
getDoctorConversations(doctorId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/conversations/doctor/${doctorId}`).pipe(
    map(conversations => {
      return conversations.map(conv => ({
        ...conv,
        patientProfilePicture: conv.patientProfilePicture || conv.profilePicture || null
      }));
    })
  );
}
}