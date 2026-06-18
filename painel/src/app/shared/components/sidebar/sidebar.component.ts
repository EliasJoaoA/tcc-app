import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, Video, MapPin, Mail, Users, LogOut } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <aside class="sidebar">
      <div class="logo">
        <h2>Conecta UEPG</h2>
        <span>Painel Gerencial</span>
      </div>
      <nav>
        <a routerLink="/dashboard" routerLinkActive="active">
          <lucide-icon [img]="LayoutDashboard" [size]="20"></lucide-icon>
          Dashboard
        </a>
        <a routerLink="/videos" routerLinkActive="active">
          <lucide-icon [img]="VideoIcon" [size]="20"></lucide-icon>
          Vídeos
        </a>
        <a routerLink="/map-points" routerLinkActive="active">
          <lucide-icon [img]="MapPin" [size]="20"></lucide-icon>
          Pontos do Mapa
        </a>
        <a routerLink="/email-templates" routerLinkActive="active">
          <lucide-icon [img]="Mail" [size]="20"></lucide-icon>
          Templates de E-mail
        </a>
        <a routerLink="/users" routerLinkActive="active">
          <lucide-icon [img]="UsersIcon" [size]="20"></lucide-icon>
          Usuários
        </a>
      </nav>
      <div class="sidebar-footer">
        <button (click)="logout()" class="logout-btn">
          <lucide-icon [img]="LogOut" [size]="18"></lucide-icon>
          Sair
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: white;
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
    }
    .logo {
      padding: 24px;
      border-bottom: 1px solid var(--border);
      h2 { color: var(--primary); font-size: 18px; }
      span { color: var(--text-light); font-size: 12px; }
    }
    nav {
      flex: 1;
      padding: 12px;
      a {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        border-radius: 8px;
        color: var(--text-secondary);
        font-weight: 500;
        transition: all 0.2s;
        &:hover { background: var(--primary-light); color: var(--primary); }
        &.active { background: var(--primary-light); color: var(--primary-dark); font-weight: 600; }
      }
    }
    .sidebar-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border);
    }
    .logout-btn {
      width: 100%;
      padding: 10px;
      border: 1.5px solid var(--danger);
      border-radius: 8px;
      background: transparent;
      color: var(--danger);
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      &:hover { background: #FFEBEE; }
    }
  `],
})
export class SidebarComponent {
  readonly LayoutDashboard = LayoutDashboard;
  readonly VideoIcon = Video;
  readonly MapPin = MapPin;
  readonly Mail = Mail;
  readonly UsersIcon = Users;
  readonly LogOut = LogOut;

  constructor(private auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
