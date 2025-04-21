import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {SidebarComponent} from "../sidebar/sidebar.component";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="d-flex">
      <!-- Sidebar (composant existant) -->
      <app-sidebar class="sidebar"></app-sidebar>
      
      <!-- Main content area -->
      <div class="main-content flex-grow-1">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      min-height: 100vh;
      background-color: #563D7C;
    }
    
    .main-content {
      min-height: 100vh;
      overflow-x: hidden;
    }
    
    @media (max-width: 768px) {
      .sidebar {
        width: 80px;
      }
    }
  `]
})
export class LayoutComponent {

}
