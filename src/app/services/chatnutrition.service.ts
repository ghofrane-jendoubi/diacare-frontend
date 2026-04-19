// chatnutrition.service.ts (étendu)
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  id: number;
  content: string;
  senderId: number;
  senderRole: 'patient' | 'nutritionist';
  receiverId: number;
  receiverRole: 'patient' | 'nutritionist';
  patientId?: number;
  isRead: boolean;
  createdAt: string;
}
export interface Nutritionist {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  phone: string;
  profilePicture?: string;
}

export interface PatientInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  diabetesType?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatNutritionService {

  private apiUrl = 'http://localhost:8081/api/message';
  private userApiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = (typeof window !== 'undefined')
      ? localStorage.getItem('token') || '' : '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ==================== EXISTANT ====================
  
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

  getPatientInfo(patientId: number): Observable<PatientInfo> {
    return this.http.get<PatientInfo>(`${this.userApiUrl}/patients/${patientId}`);
  }

  // ==================== NOUVEAU - PATIENT SIDE ====================
  
  // Récupérer la liste des nutritionnistes pour le patient
  getNutritionists(): Observable<Nutritionist[]> {
    return this.http.get<Nutritionist[]>(
      `${this.userApiUrl}/nutritionists/all`,
      { headers: this.getHeaders() }
    );
  }

  // Récupérer les conversations du patient avec les nutritionnistes
  getPatientNutritionistConversations(patientId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/patient/${patientId}/conversations`,
      { headers: this.getHeaders() }
    );
  }

  // Récupérer les messages entre patient et nutritionniste spécifique
  getMessagesWithNutritionist(patientId: number, nutritionistId: number): Observable<ChatMessage[]> {
  // L'ordre des paramètres dépend de ton backend
  // Si ton endpoint est /conversation/{nutritionistId}/{patientId}
  return this.http.get<ChatMessage[]>(
    `${this.apiUrl}/conversation/${nutritionistId}/${patientId}`,
    { headers: this.getHeaders() }
  );
}

  // ==================== NOUVEAU - NUTRITIONIST SIDE ====================
  
  // Récupérer la liste des patients du nutritionniste
  getNutritionistPatients(nutritionistId: number): Observable<PatientInfo[]> {
    return this.http.get<PatientInfo[]>(
      `${this.userApiUrl}/nutritionists/${nutritionistId}/patients`,
      { headers: this.getHeaders() }
    );
  }

  // Récupérer les conversations du nutritionniste
  getNutritionistConversations(nutritionistId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/nutritionist/${nutritionistId}/conversations`,
      { headers: this.getHeaders() }
    );
  }

  // Récupérer les messages entre nutritionniste et patient spécifique
  getNutritionistMessagesWithPatient(nutritionistId: number, patientId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.apiUrl}/conversation/${nutritionistId}/${patientId}`,
      { headers: this.getHeaders() }
    );
  }
}