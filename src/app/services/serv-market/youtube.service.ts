import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class YouTubeService {
  private apiUrl = 'http://localhost:8081/api/products';

  constructor(private http: HttpClient) {}

  getProductVideos(productId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${productId}/videos`);
  }
}