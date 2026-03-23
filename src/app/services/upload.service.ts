import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = 'http://localhost:8081/api/upload';

  constructor(private http: HttpClient) { }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name); // ← Important : ajouter le nom du fichier
    
    return this.http.post(`${this.apiUrl}/image`, formData, {
      // Important pour l'upload de fichiers
      headers: {
        // Ne pas mettre 'Content-Type', le navigateur le gère automatiquement avec FormData
      }
    });
  }

  uploadAudio(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    
    return this.http.post(`${this.apiUrl}/audio`, formData);
  }
  uploadDocument(file: File): Observable<any> {
  const formData = new FormData();
  formData.append('file', file, file.name);
  return this.http.post(`${this.apiUrl}/document`, formData);
}
}