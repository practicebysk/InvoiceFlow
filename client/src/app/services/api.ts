import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private baseUrl = 'http://localhost:4000/api';

  constructor(private http: HttpClient) { }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, data, { withCredentials: true });
  }

  createInvoice(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/invoices`, data, { withCredentials: true });
  }

  getInvoices(paramsObj: any) {
    let params = new HttpParams();
    Object.keys(paramsObj).forEach(key => {
      const value = paramsObj[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value);
      }
    });
    return this.http.get(`${this.baseUrl}/invoices`, { params });
  }

  downloadInvoicePdf(id: string) {
    return this.http.get(`${this.baseUrl}/invoices/${id}/pdf`, { responseType: "blob" });
  }
  
  shareInvoicePdf(id: string) {
    return this.http.get(`${this.baseUrl}/invoices/${id}/pdf-link`, { responseType: "blob" });
  }
}
