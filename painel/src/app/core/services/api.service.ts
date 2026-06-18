import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: any): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${path}`, { params })
      .pipe(map(res => res.data));
  }

  post<T>(path: string, body?: any): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${path}`, body)
      .pipe(map(res => res.data));
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${path}`, body)
      .pipe(map(res => res.data));
  }

  patch<T>(path: string, body?: any): Observable<T> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${path}`, body)
      .pipe(map(res => res.data));
  }

  delete(path: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${path}`);
  }
}
