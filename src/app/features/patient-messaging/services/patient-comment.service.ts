import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EducationComment } from '../../education/models/comment';

@Injectable({
  providedIn: 'root'
})
export class PatientCommentService {
  private educationApiUrl = 'http://localhost:8090/api/education';

  constructor(private http: HttpClient) {}

  // Ajouter un commentaire en tant que patient
  addComment(contentId: number, commentText: string, parentCommentId?: number, userName?: string): Observable<EducationComment> {
    const body: any = {
      commentText: commentText,
      userName: userName || 'Patient DiaCare'
    };

    if (parentCommentId) {
      body.parentCommentId = parentCommentId;
    }

    return this.http.post<EducationComment>(`${this.educationApiUrl}/contents/${contentId}/comments`, body);
  }

  // Récupérer les commentaires d'un contenu
  getComments(contentId: number): Observable<EducationComment[]> {
    return this.http.get<EducationComment[]>(`${this.educationApiUrl}/contents/${contentId}/comments`);
  }

  // Récupérer les réponses des médecins aux messages du patient
  getDoctorReplies(patientId: number): Observable<EducationComment[]> {
    return this.http.get<EducationComment[]>(`http://localhost:8090/api/patient/doctor-replies/${patientId}`);
  }
}
