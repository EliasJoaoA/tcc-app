import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ShieldCheck, ShieldOff } from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import type { User } from '../../core/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="page-header">
      <h1>Usuários</h1>
    </div>

    @if (loading) {
      <div class="card"><p>Carregando...</p></div>
    } @else {
      <div class="card">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Curso</th>
              <th>Papel</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (user of users; track user.id) {
              <tr>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.course || '—' }}</td>
                <td>
                  <span class="badge" [class.badge-admin]="user.role === 'admin'" [class.badge-student]="user.role === 'student'">
                    {{ user.role === 'admin' ? 'Admin' : 'Estudante' }}
                  </span>
                </td>
                <td>
                  <button
                    class="btn btn-outline"
                    (click)="toggleRole(user)"
                    [disabled]="togglingId === user.id"
                  >
                    @if (user.role === 'admin') {
                      <lucide-icon [img]="ShieldOff" [size]="14"></lucide-icon> Tornar Estudante
                    } @else {
                      <lucide-icon [img]="ShieldCheck" [size]="14"></lucide-icon> Tornar Admin
                    }
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    .btn { display: inline-flex; align-items: center; gap: 6px; }
  `],
})
export class UsersComponent implements OnInit {
  readonly ShieldCheck = ShieldCheck;
  readonly ShieldOff = ShieldOff;

  users: User[] = [];
  togglingId: number | null = null;
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.get<User[]>('/admin/users').subscribe({
      next: (data) => { this.users = Array.isArray(data) ? data : []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  toggleRole(user: User) {
    const newRole = user.role === 'admin' ? 'student' : 'admin';
    if (!confirm(`Alterar ${user.name} para ${newRole}?`)) return;
    this.togglingId = user.id;
    this.api.patch(`/admin/users/${user.id}/role`, { role: newRole }).subscribe({
      next: () => { this.load(); this.togglingId = null; },
      error: () => { this.togglingId = null; },
    });
  }
}
