import {Component, Input, Output, EventEmitter} from '@angular/core';
import {SortOption} from "../../../users/users.models";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center py-3">
      <div class="search-container position-relative">
        <input 
          type="text" 
          class="form-control ps-5" 
          placeholder="Search here..." 
          [(ngModel)]="searchTerm"
          (input)="onSearch()"
        >
        <i class="bi bi-search position-absolute" style="left: 15px; top: 10px;"></i>
      </div>
      
      <div class="d-flex mt-3 mt-sm-0">
        <div class="dropdown me-2">
          <button class="btn btn-outline-primary dropdown-toggle" type="button" id="sortDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            {{ currentSort | titlecase }}
          </button>
          <ul class="dropdown-menu" aria-labelledby="sortDropdown">
            <li><a class="dropdown-item" (click)="onSortChange('newest')">Newest</a></li>
            <li><a class="dropdown-item" (click)="onSortChange('oldest')">Oldest</a></li>
            <li><a class="dropdown-item" (click)="onSortChange('age')">Age</a></li>
            <li><a class="dropdown-item" (click)="onSortChange('class')">Class</a></li>
          </ul>
        </div>
        
        <button 
          class="btn btn-primary d-flex align-items-center" 
          [routerLink]="newItemRoute"
        >
          <i class="bi bi-plus-lg me-1"></i> {{ newButtonText }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      flex: 1;
      max-width: 500px;
    }
    
    @media (max-width: 576px) {
      .search-container {
        width: 100%;
      }
    }
  `]
})
export class SearchBarComponent {
  @Input() newButtonText: string = 'New Item';
  @Input() newItemRoute: string = '/';
  @Input() currentSort: SortOption = 'newest';

  @Output() sortChange = new EventEmitter<SortOption>();
  @Output() searchChange = new EventEmitter<string>();

  searchTerm: string = '';

  onSortChange(option: SortOption): void {
    this.currentSort = option;
    this.sortChange.emit(option);
  }

  onSearch(): void {
    this.searchChange.emit(this.searchTerm);
  }
}
