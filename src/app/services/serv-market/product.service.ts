import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../../models/product';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {}

  // ✅ GET ALL
  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
  

  // ✅ ADD NORMAL
  add(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  // ✅ ADD WITH IMAGE 🔥 (CE QUI MANQUE CHEZ TOI)
  addWithImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  // ✅ UPDATE
  update(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  // ✅ UPDATE WITH IMAGE
  updateWithImage(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/upload/${id}`, formData);
  }

  // ✅ DELETE
  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ✅ IMAGE URL
  getImageUrl(filename: string): string {
    return `${this.apiUrl}/images/${filename}`;
  }
}