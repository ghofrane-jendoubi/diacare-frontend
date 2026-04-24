import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../../models/product';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'http://localhost:8081/api/products';

  constructor(private http: HttpClient) {}

  // ✅ GET ALL
  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // ✅ ADD WITH IMAGE
  addWithImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  // ✅ UPDATE WITHOUT IMAGE - CORRIGÉ
  update(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  // ✅ UPDATE WITH IMAGE - CORRIGÉ (utilisation du même endpoint PUT /{id})
  updateWithImage(id: number, formData: FormData): Observable<Product> {
    // Le backend accepte les FormData sur PUT /{id}
    return this.http.put<Product>(`${this.apiUrl}/${id}`, formData);
  }

  // ✅ DELETE
  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ✅ IMAGE URL
  getImageUrl(filename: string): string {
    if (!filename) return 'assets/placeholder.png';
    if (filename.startsWith('http')) return filename;
    return `${this.apiUrl}/images/${filename}`;
  }
}