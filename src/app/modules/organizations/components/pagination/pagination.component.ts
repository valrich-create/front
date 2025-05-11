// shared/pagination/pagination.component.ts
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="pagination-container">
      <button class="pagination-arrow" [disabled]="currentPage === 1" (click)="onPrevious()">
        <fa-icon [icon]="faChevronLeft"></fa-icon>
      </button>
      
      <div class="pagination-pages">
        <ng-container *ngFor="let page of visiblePages">
          <button 
            class="pagination-page" 
            [class.active]="page === currentPage"
            (click)="onPageSelect(page)">
            {{ page }}
          </button>
        </ng-container>
      </div>
      
      <button class="pagination-arrow" [disabled]="currentPage === totalPages" (click)="onNext()">
        <fa-icon [icon]="faChevronRight"></fa-icon>
      </button>
    </div>
  `,
  styles: [`
    .pagination-container {
      display: flex;
      align-items: center;
    }
    
    .pagination-arrow {
      background: none;
      border: 1px solid #ddd;
      border-radius: 50%;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #888;
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      &:not(:disabled):hover {
        background-color: #f8f8f8;
        color: #333;
      }
    }
    
    .pagination-pages {
      display: flex;
      margin: 0 0.5rem;
      
      .pagination-page {
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        border: none;
        background: none;
        margin: 0 0.25rem;
        cursor: pointer;
        color: #888;
        
        &.active {
          background-color: #5B5FCE;
          color: #fff;
        }
        
        &:not(.active):hover {
          background-color: #f8f8f8;
          color: #333;
        }
      }
    }
    
    @media (max-width: 480px) {
      .pagination-page {
        margin: 0 0.1rem;
      }
    }
  `]
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() visiblePagesCount: number = 3;

  @Output() pageChange = new EventEmitter<number>();

  totalPages: number = 1;
  visiblePages: number[] = [];

  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;

  ngOnChanges(changes: SimpleChanges): void {
    this.calculateTotalPages();
    this.generateVisiblePages();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  }

  generateVisiblePages(): void {
    const halfVisible = Math.floor(this.visiblePagesCount / 2);
    let start = Math.max(this.currentPage - halfVisible, 1);
    let end = Math.min(start + this.visiblePagesCount - 1, this.totalPages);

    if (end - start + 1 < this.visiblePagesCount) {
      start = Math.max(end - this.visiblePagesCount + 1, 1);
    }

    this.visiblePages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  onPageSelect(page: number): void {
    if (page !== this.currentPage) {
      this.currentPage = page;
      this.pageChange.emit(this.currentPage);
    }
  }

  onPrevious(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.generateVisiblePages();
      this.pageChange.emit(this.currentPage);
    }
  }

  onNext(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.generateVisiblePages();
      this.pageChange.emit(this.currentPage);
    }
  }
}