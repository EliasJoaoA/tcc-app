import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <app-sidebar />
    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: [`
    :host { display: flex; }
    .main-content {
      margin-left: var(--sidebar-width);
      flex: 1;
      padding: 32px;
      min-height: 100vh;
    }
  `],
})
export class LayoutComponent {}
