// filter-tabs.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tabs-container">
      <div class="tabs">
        <button 
          *ngFor="let tab of tabs" 
          [class.active]="tab === activeTab"
          (click)="selectTab(tab)" 
          class="tab">
          {{ tab }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .tabs-container {
      width: 100%;
      overflow-x: auto;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .tabs {
      display: flex;
      min-width: max-content;
    }
    
    .tab {
      padding: 0.75rem 1.25rem;
      font-size: 0.875rem;
      cursor: pointer;
      background: transparent;
      border: none;
      position: relative;
      color: #64748b;
      transition: color 0.2s;
    }
    
    .tab:hover {
      color: #4338ca;
    }
    
    .tab.active {
      color: #4338ca;
      font-weight: 600;
    }
    
    .tab.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: #4338ca;
    }
  `]
})
export class FilterTabsComponent {
  @Input() tabs: string[] = [];
  @Input() activeTab: string = '';
  @Output() tabChange = new EventEmitter<string>();

  selectTab(tab: string): void {
    if (tab !== this.activeTab) {
      this.tabChange.emit(tab);
    }
  }
}