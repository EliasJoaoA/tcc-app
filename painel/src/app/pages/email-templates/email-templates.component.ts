import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Pencil, Trash2 } from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import type { EmailTemplate } from '../../core/models';

@Component({
  selector: 'app-email-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="page-header">
      <h1>Templates de E-mail</h1>
      <button class="btn btn-primary" (click)="openForm()">
        <lucide-icon [img]="Plus" [size]="16"></lucide-icon> Novo Template
      </button>
    </div>

    @if (loading) {
      <div class="card"><p>Carregando...</p></div>
    } @else {
      <div class="card">
        @if (templates.length === 0) {
          <p style="color: var(--text-light); text-align: center; padding: 32px">Nenhum template cadastrado.</p>
        } @else {
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Assunto</th>
                <th>Ordem</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (tpl of templates; track tpl.id) {
                <tr>
                  <td>{{ tpl.title }}</td>
                  <td>{{ categoryLabel(tpl.category) }}</td>
                  <td>{{ tpl.subject }}</td>
                  <td>{{ tpl.order }}</td>
                  <td><span class="badge" [class.badge-active]="tpl.is_active" [class.badge-inactive]="!tpl.is_active">{{ tpl.is_active ? 'Ativo' : 'Inativo' }}</span></td>
                  <td class="actions">
                    <button class="btn btn-outline" (click)="openForm(tpl)"><lucide-icon [img]="Pencil" [size]="14"></lucide-icon> Editar</button>
                    <button class="btn btn-danger" (click)="deleteTemplate(tpl.id)"><lucide-icon [img]="Trash2" [size]="14"></lucide-icon> Excluir</button>
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
            <h2>{{ editing ? 'Editar Template' : 'Novo Template' }}</h2>
            <button class="close-btn" (click)="showForm = false">&times;</button>
          </div>

          <div class="form-group">
            <label>Título *</label>
            <input [(ngModel)]="form.title" placeholder="Ex: Solicitar ajuda ao professor" />
          </div>
          <div class="form-group">
            <label>Categoria *</label>
            <select [(ngModel)]="form.category">
              <option value="professor">Professor</option>
              <option value="group">Grupo de Trabalho</option>
              <option value="coordination">Coordenação</option>
              <option value="other">Outro</option>
            </select>
          </div>
          <div class="form-group">
            <label>Assunto do E-mail *</label>
            <input [(ngModel)]="form.subject" placeholder="Assunto" />
          </div>
          <div class="form-group">
            <label>Corpo do E-mail *</label>
            <textarea [(ngModel)]="form.body" placeholder="Use placeholders: {{ '{' }}nome{{ '}' }}, {{ '{' }}disciplina{{ '}' }}, {{ '{' }}professor{{ '}' }}" rows="8"></textarea>
          </div>
          <div class="placeholders">
            <span>Placeholders:</span>
            <code>{{ '{' }}nome{{ '}' }}</code>
            <code>{{ '{' }}disciplina{{ '}' }}</code>
            <code>{{ '{' }}professor{{ '}' }}</code>
          </div>

          @if (form.body) {
            <div class="preview card">
              <strong>Preview:</strong>
              <p style="white-space: pre-wrap; margin-top: 8px">{{ renderPreview() }}</p>
            </div>
          }

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
    .placeholders {
      margin-bottom: 16px; font-size: 12px; color: var(--text-light);
      code { background: var(--primary-light); color: var(--primary-dark); padding: 2px 8px; border-radius: 4px; margin-left: 4px; }
    }
    .preview { margin-bottom: 16px; background: #F8F9FB; font-size: 13px; }
  `],
})
export class EmailTemplatesComponent implements OnInit {
  readonly Plus = Plus;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;

  templates: EmailTemplate[] = [];
  showForm = false;
  editing: EmailTemplate | null = null;
  saving = false;
  loading = true;
  form = this.emptyForm();

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.get<EmailTemplate[]>('/admin/email-templates').subscribe({
      next: (data) => { this.templates = Array.isArray(data) ? data : []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  emptyForm() {
    return { title: '', category: 'professor' as string, subject: '', body: '', order: 0, is_active: true };
  }

  categoryLabel(cat: string): string {
    const m: Record<string, string> = { professor: 'Professor', group: 'Grupo', coordination: 'Coordenação', other: 'Outro' };
    return m[cat] || cat;
  }

  openForm(tpl?: EmailTemplate) {
    if (tpl) {
      this.editing = tpl;
      this.form = { title: tpl.title, category: tpl.category, subject: tpl.subject, body: tpl.body, order: tpl.order, is_active: tpl.is_active };
    } else {
      this.editing = null;
      this.form = this.emptyForm();
    }
    this.showForm = true;
  }

  renderPreview(): string {
    return this.form.body.replace(/{nome}/g, 'João Silva').replace(/{disciplina}/g, 'Algoritmos').replace(/{professor}/g, 'Prof. Maria');
  }

  save() {
    this.saving = true;
    const obs = this.editing
      ? this.api.put(`/admin/email-templates/${this.editing.id}`, this.form)
      : this.api.post('/admin/email-templates', this.form);
    obs.subscribe({
      next: () => { this.showForm = false; this.load(); this.saving = false; },
      error: () => { this.saving = false; },
    });
  }

  deleteTemplate(id: number) {
    if (confirm('Excluir este template?')) {
      this.api.delete(`/admin/email-templates/${id}`).subscribe(() => this.load());
    }
  }
}
