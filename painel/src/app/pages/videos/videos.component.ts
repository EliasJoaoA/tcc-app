import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Pencil, Trash2 } from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import type { Video } from '../../core/models';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="page-header">
      <h1>Vídeos</h1>
      <button class="btn btn-primary" (click)="openForm()">
        <lucide-icon [img]="Plus" [size]="16"></lucide-icon> Novo Vídeo
      </button>
    </div>

    @if (loading) {
      <div class="card"><p>Carregando...</p></div>
    } @else if (error) {
      <div class="card"><p style="color: var(--danger)">Erro ao carregar: {{ error }}</p></div>
    } @else {
      <div class="card">
        @if (videos.length === 0) {
          <p style="color: var(--text-light); text-align: center; padding: 32px">Nenhum vídeo cadastrado.</p>
        } @else {
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Ordem</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (video of videos; track video.id) {
                <tr>
                  <td>{{ video.title }}</td>
                  <td>{{ video.category || '—' }}</td>
                  <td>{{ video.order }}</td>
                  <td><span class="badge" [class.badge-active]="video.is_active" [class.badge-inactive]="!video.is_active">{{ video.is_active ? 'Ativo' : 'Inativo' }}</span></td>
                  <td class="actions">
                    <button class="btn btn-outline" (click)="openForm(video)">
                      <lucide-icon [img]="Pencil" [size]="14"></lucide-icon> Editar
                    </button>
                    <button class="btn btn-danger" (click)="deleteVideo(video.id)">
                      <lucide-icon [img]="Trash2" [size]="14"></lucide-icon> Excluir
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    }

    @if (showForm) {
      <div class="modal-backdrop" (click)="showForm = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editing ? 'Editar Vídeo' : 'Novo Vídeo' }}</h2>
            <button class="close-btn" (click)="showForm = false">&times;</button>
          </div>

          <div class="form-group">
            <label>Título *</label>
            <input [(ngModel)]="form.title" placeholder="Título do vídeo" />
          </div>
          <div class="form-group">
            <label>Descrição</label>
            <textarea [(ngModel)]="form.description" placeholder="Descrição"></textarea>
          </div>
          <div class="form-group">
            <label>Categoria</label>
            <input [(ngModel)]="form.category" placeholder="Ex: Bem-estar, Organização" />
          </div>
          <div class="form-group">
            <label>URL do vídeo *</label>
            <input [(ngModel)]="form.url" placeholder="https://youtube.com/..." />
          </div>

          <div style="display:flex; gap:12px">
            <div class="form-group" style="flex:1">
              <label>Ordem</label>
              <input type="number" [(ngModel)]="form.order" />
            </div>
            <div class="form-group" style="flex:1">
              <label>Status</label>
              <select [(ngModel)]="form.is_active">
                <option [ngValue]="true">Ativo</option>
                <option [ngValue]="false">Inativo</option>
              </select>
            </div>
          </div>

          <button class="btn btn-primary" style="width:100%" (click)="save()" [disabled]="saving">
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .actions { display: flex; gap: 8px; }
    .btn { display: inline-flex; align-items: center; gap: 6px; }
  `],
})
export class VideosComponent implements OnInit {
  readonly Plus = Plus;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;

  videos: Video[] = [];
  showForm = false;
  editing: Video | null = null;
  saving = false;
  loading = true;
  error = '';
  form = this.emptyForm();

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.error = '';
    this.api.get<Video[]>('/admin/videos').subscribe({
      next: (data) => {
        this.videos = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Erro desconhecido';
        this.loading = false;
        console.error('Videos load error:', err);
      },
    });
  }

  emptyForm() {
    return { title: '', description: '', category: '', url: '', order: 0, is_active: true };
  }

  openForm(video?: Video) {
    if (video) {
      this.editing = video;
      this.form = { title: video.title, description: video.description || '', category: video.category || '', url: video.url, order: video.order, is_active: video.is_active };
    } else {
      this.editing = null;
      this.form = this.emptyForm();
    }
    this.showForm = true;
  }

  save() {
    this.saving = true;
    const obs = this.editing
      ? this.api.put(`/admin/videos/${this.editing.id}`, this.form)
      : this.api.post('/admin/videos', this.form);

    obs.subscribe({
      next: () => { this.showForm = false; this.load(); this.saving = false; },
      error: () => { this.saving = false; },
    });
  }

  deleteVideo(id: number) {
    if (confirm('Excluir este vídeo?')) {
      this.api.delete(`/admin/videos/${id}`).subscribe(() => this.load());
    }
  }
}
