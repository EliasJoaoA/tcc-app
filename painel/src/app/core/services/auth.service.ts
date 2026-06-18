import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import type { User, ApiResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiUrl}/api/v1`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const stored = localStorage.getItem('user');
    if (stored) {
      this.currentUserSubject.next(JSON.parse(stored));
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<ApiResponse<{ token: string; user: User }>>(`${this.baseUrl}/auth/login`, { email, password })
      .pipe(
        map(res => res.data),
        tap(data => {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          this.currentUserSubject.next(data.user);
        }),
        map(data => data.user),
      );
  }

  logout(): void {
    this.http.post(`${this.baseUrl}/auth/logout`, {}).subscribe();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
}
