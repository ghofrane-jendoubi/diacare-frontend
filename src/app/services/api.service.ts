import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {}

  // ✅ GET all products
  getProducts(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // ✅ ADD product
  addProduct(product: any): Observable<any> {
    return this.http.post(this.apiUrl, product);
  }

}