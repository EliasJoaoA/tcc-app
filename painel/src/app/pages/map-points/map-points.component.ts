import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Pencil, Trash2 } from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import type { MapPoint } from '../../core/models';

@Component({
  selector: 'app-map-points',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="page-header">
      <h1>Pontos do Mapa</h1>
      <button class="btn btn-primary" (click)="openForm()">
        <lucide-icon [img]="Plus" [size]="16"></lucide-icon> Novo Ponto
      </button>
    </div>

    @if (loading) {
      <div class="card"><p>Carregando...</p></div>
    } @else {
      <div class="card">
        @if (points.length === 0) {
          <p style="color: var(--text-light); text-align: center; padding: 32px">Nenhum ponto cadastrado.</p>
        } @else {
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Andar</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (point of points; track point.id) {
                <tr>
                  <td>{{ point.name }}</td>
                  <td><span class="badge" [style.background]="typeColor(point.type) + '20'" [style.color]="typeColor(point.type)">{{ typeLabel(point.type) }}</span></td>
                  <td>{{ point.floor || '—' }}</td>
                  <td><span class="badge" [class.badge-active]="point.is_active" [class.badge-inactive]="!point.is_active">{{ point.is_active ? 'Ativo' : 'Inativo' }}</span></td>
                  <td class="actions">
                    <button class="btn btn-outline" (click)="openForm(point)"><lucide-icon [img]="Pencil" [size]="14"></lucide-icon> Editar</button>
                    <button class="btn btn-danger" (click)="deletePoint(point.id)"><lucide-icon [img]="Trash2" [size]="14"></lucide-icon> Excluir</button>
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
            <h2>{{ editing ? 'Editar Ponto' : 'Novo Ponto' }}</h2>
            <button class="close-btn" (click)="showForm = false">&times;</button>
          </div>

          <div class="form-group">
            <label>Nome *</label>
            <input [(ngModel)]="form.name" placeholder="Nome do local" />
          </div>
          <div class="form-group">
            <label>Descrição</label>
            <textarea [(ngModel)]="form.description" placeholder="Descrição do ponto"></textarea>
          </div>
          <div class="form-group">
            <label>Tipo *</label>
            <select [(ngModel)]="form.type">
              <option value="quiet_zone">Zona Silenciosa</option>
              <option value="rest_point">Ponto de Descanso</option>
              <option value="building">Prédio</option>
              <option value="service">Serviço</option>
            </select>
          </div>
          <div class="form-group">
            <label>Link do Google Maps</label>
            <div class="link-row">
              <input
                [(ngModel)]="googleMapsLink"
                placeholder="Cole a URL do Google Maps"
              />
              <button type="button" class="btn btn-outline" (click)="extractFromLink()" [disabled]="extracting">
                {{ extracting ? 'Extraindo...' : 'Extrair' }}
              </button>
            </div>
            @if (extractError) {
              <p class="hint hint-error">{{ extractError }}</p>
            } @else {
              <p class="hint">Aceita links completos e também links encurtados de compartilhamento.</p>
            }
          </div>

          <div style="display:flex; gap:12px">
            <div class="form-group" style="flex:1">
              <label>Latitude *</label>
              <input type="number" step="0.00000001" [(ngModel)]="form.latitude" />
            </div>
            <div class="form-group" style="flex:1">
              <label>Longitude *</label>
              <input type="number" step="0.00000001" [(ngModel)]="form.longitude" />
            </div>
          </div>
          <div style="display:flex; gap:12px">
            <div class="form-group" style="flex:1">
              <label>Andar</label>
              <input [(ngModel)]="form.floor" placeholder="Ex: Térreo, 1º andar" />
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
    .hint { color: var(--text-light); font-size: 12px; margin: 6px 0 0; }
    .hint-error { color: var(--danger); }
    .link-row {
      display: flex;
      gap: 8px;
      align-items: stretch;
      input { flex: 1; min-width: 0; }
      button { white-space: nowrap; flex-shrink: 0; }
    }
  `],
})
export class MapPointsComponent implements OnInit {
  readonly Plus = Plus;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;

  points: MapPoint[] = [];
  showForm = false;
  editing: MapPoint | null = null;
  saving = false;
  loading = true;
  form = this.emptyForm();
  googleMapsLink = '';
  extractError = '';
  extracting = false;

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.get<MapPoint[]>('/admin/map-points').subscribe({
      next: (data) => { this.points = Array.isArray(data) ? data : []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  emptyForm() {
    return { name: '', description: '', type: 'building' as string, latitude: -25.0947, longitude: -50.1618, floor: '', is_active: true };
  }

  openForm(point?: MapPoint) {
    this.googleMapsLink = '';
    this.extractError = '';
    if (point) {
      this.editing = point;
      this.form = { name: point.name, description: point.description || '', type: point.type, latitude: point.latitude, longitude: point.longitude, floor: point.floor || '', is_active: point.is_active };
    } else {
      this.editing = null;
      this.form = this.emptyForm();
    }
    this.showForm = true;
  }

  extractFromLink() {
    this.extractError = '';
    const url = this.googleMapsLink.trim();
    if (!url) {
      this.extractError = 'Cole uma URL antes de extrair.';
      return;
    }

    // Links curtos precisam do backend para resolver redirect
    const isShort = /(maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(url);

    if (isShort) {
      this.extracting = true;
      this.api.post<{ latitude: number; longitude: number }>('/admin/map-points/extract-coords', { url }).subscribe({
        next: (coords) => {
          this.form.latitude = coords.latitude;
          this.form.longitude = coords.longitude;
          this.googleMapsLink = '';
          this.extracting = false;
        },
        error: (err) => {
          this.extractError = err.error?.message || 'Erro ao resolver o link.';
          this.extracting = false;
        },
      });
      return;
    }

    // URLs completas — extrai client-side
    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
      /\/(-?\d+\.\d+),(-?\d+\.\d+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        this.form.latitude = parseFloat(match[1]);
        this.form.longitude = parseFloat(match[2]);
        this.googleMapsLink = '';
        return;
      }
    }

    this.extractError = 'Não foi possível extrair coordenadas. Use um link completo ou de compartilhamento.';
  }

  typeLabel(type: string): string {
    const m: Record<string, string> = { quiet_zone: 'Zona Silenciosa', rest_point: 'Ponto de Descanso', building: 'Prédio', service: 'Serviço' };
    return m[type] || type;
  }

  typeColor(type: string): string {
    const m: Record<string, string> = { quiet_zone: '#4A90D9', rest_point: '#6EC6A0', building: '#9E9E9E', service: '#FF9800' };
    return m[type] || '#999';
  }

  save() {
    this.saving = true;
    const obs = this.editing
      ? this.api.put(`/admin/map-points/${this.editing.id}`, this.form)
      : this.api.post('/admin/map-points', this.form);
    obs.subscribe({
      next: () => { this.showForm = false; this.load(); this.saving = false; },
      error: () => { this.saving = false; },
    });
  }

  deletePoint(id: number) {
    if (confirm('Excluir este ponto?')) {
      this.api.delete(`/admin/map-points/${id}`).subscribe(() => this.load());
    }
  }
}
