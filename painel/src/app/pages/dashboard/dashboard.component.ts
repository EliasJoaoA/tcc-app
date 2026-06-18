import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Users, Video, MapPin, Mail } from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import type { DashboardStats } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="page-header">
      <h1>Dashboard</h1>
    </div>

    <div class="stats-grid">
      <div class="stat-card card">
        <div class="stat-icon" style="background: #E3F2FD; color: #4A90D9">
          <lucide-icon [img]="UsersIcon" [size]="28"></lucide-icon>
        </div>
        <div class="stat-value">{{ stats?.total_users ?? '—' }}</div>
        <div class="stat-label">Usuários</div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon" style="background: #FFF3E0; color: #FF9800">
          <lucide-icon [img]="VideoIcon" [size]="28"></lucide-icon>
        </div>
        <div class="stat-value">{{ stats?.total_videos ?? '—' }}</div>
        <div class="stat-label">Vídeos Ativos</div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon" style="background: #E8F5E9; color: #4CAF50">
          <lucide-icon [img]="MapPinIcon" [size]="28"></lucide-icon>
        </div>
        <div class="stat-value">{{ stats?.total_map_points ?? '—' }}</div>
        <div class="stat-label">Pontos no Mapa</div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon" style="background: #F3E5F5; color: #7B1FA2">
          <lucide-icon [img]="MailIcon" [size]="28"></lucide-icon>
        </div>
        <div class="stat-value">{{ stats?.total_email_templates ?? '—' }}</div>
        <div class="stat-label">Templates de E-mail</div>
      </div>
    </div>

    <div class="card" style="margin-top: 24px">
      <h2 style="margin-bottom: 16px">Usuários Recentes</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Papel</th>
            <th>Cadastro</th>
          </tr>
        </thead>
        <tbody>
          @for (user of stats?.recent_users ?? []; track user.id) {
            <tr>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td><span class="badge" [class.badge-admin]="user.role === 'admin'" [class.badge-student]="user.role === 'student'">{{ user.role === 'admin' ? 'Admin' : 'Estudante' }}</span></td>
              <td>{{ user.created_at | date:'dd/MM/yyyy' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .stat-card {
      text-align: center;
      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
      }
      .stat-value { font-size: 32px; font-weight: 700; color: var(--primary); margin-bottom: 4px; }
      .stat-label { color: var(--text-secondary); font-size: 13px; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  readonly UsersIcon = Users;
  readonly VideoIcon = Video;
  readonly MapPinIcon = MapPin;
  readonly MailIcon = Mail;

  stats: DashboardStats | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<DashboardStats>('/admin/dashboard').subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error('Dashboard error:', err),
    });
  }
}
