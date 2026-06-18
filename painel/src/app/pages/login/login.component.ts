import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="login-container">
      <div class="login-card card">
        <h1>Conecta UEPG</h1>
        <p class="subtitle">Painel Gerencial</p>

        @if (error) {
          <div class="error-msg">{{ error }}</div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>E-mail</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="admin&#64;uepg.br" required />
          </div>
          <div class="form-group">
            <label>Senha</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="Sua senha" required />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%" [disabled]="loading">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
    }
    .login-card {
      width: 400px;
      text-align: center;
      h1 { color: var(--primary); font-size: 28px; margin-bottom: 4px; }
      .subtitle { color: var(--text-light); margin-bottom: 32px; }
    }
    .error-msg {
      background: #FFEBEE;
      color: var(--danger);
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 13px;
    }
    form { text-align: left; }
  `],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: (user) => {
        if (user.role !== 'admin') {
          this.error = 'Acesso restrito a administradores.';
          this.auth.logout();
          this.loading = false;
          return;
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Credenciais inválidas.';
        this.loading = false;
      },
    });
  }
}
