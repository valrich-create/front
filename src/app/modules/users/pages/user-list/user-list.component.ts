import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { NavbarComponent } from "../../../base-component/components/navbar/navbar.component";
import { SearchBarComponent } from "../../../base-component/components/search-bar/search-bar.component";
import { UserRowComponent } from "../../components/user-row/user-row.component";
import { UserService } from "../../services/user.service";
import { ToastService } from "../../../base-component/services/toast/toast.service";
import { UserResponse, SortOption } from "../../users.models";
import { LayoutComponent } from "../../../base-component/components/layout/layout.component";
import { Page } from "../../users.models";

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SearchBarComponent, UserRowComponent, LayoutComponent],
  template: `
    <app-layout>
      <div class="container-fluid p-0">
        <app-navbar
            [pageTitle]="'Users'">
        </app-navbar>

        <div class="px-4">
          <app-search-bar
              newButtonText="New User"
              newItemRoute="/users/new"
              [currentSort]="currentSort"
              (sortChange)="onSortChange($event)"
              (searchChange)="onSearchChange($event)">
          </app-search-bar>

          <!-- Table Header -->
          <div class="d-flex align-items-center py-2 px-3 bg-light border-top border-bottom">
            <div class="form-check me-3">
              <input class="form-check-input" type="checkbox" [checked]="allSelected" (change)="toggleAllSelection()">
            </div>

            <div style="width: 40px;" class="me-3"></div>

            <div class="flex-grow-1">
              <strong>Name</strong>
            </div>

            <div class="d-none d-md-block text-center" style="width: 120px;">
              <strong>ID</strong>
            </div>

            <div class="d-none d-md-block text-center" style="width: 120px;">
              <strong>Date</strong>
            </div>

            <div class="text-center" style="width: 100px;">
              <strong>Role</strong>
            </div>

            <div style="width: 40px;">
              <strong>Action</strong>
            </div>
          </div>

          <!-- User Rows -->
          <div class="user-list">
            <app-user-row
                *ngFor="let user of usersPage?.content || []"
                [user]="user"
                [isSelected]="selectedUserIds.includes(user.id)"
                (toggleSelect)="toggleUserSelection($event)"
                (delete)="deleteUser($event)">
            </app-user-row>
          </div>

          <!-- Pagination -->
          <div class="d-flex justify-content-between align-items-center py-3" *ngIf="usersPage">
            <div class="text-muted">
<!--              Showing {{usersPage.number * usersPage.size + 1}}-{{usersPage.number * usersPage.size + usersPage.numberOfElements}} -->
<!--              from {{ usersPage.totalElements }} users-->
              {{ getPaginationText() }}
            </div>

            <nav aria-label="User pagination">
              <ul class="pagination mb-0">
                <li class="page-item" [class.disabled]="usersPage.first">
                  <a class="page-link" (click)="loadPage(usersPage.number - 1)" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                  </a>
                </li>
                <li class="page-item" *ngFor="let page of getPages()" [class.active]="page === usersPage.number">
                  <a class="page-link" (click)="loadPage(page)">{{page + 1}}</a>
                </li>
                <li class="page-item" [class.disabled]="usersPage.last">
                  <a class="page-link" (click)="loadPage(usersPage.number + 1)" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .user-list {
      max-height: calc(100vh - 250px);
      overflow-y: auto;
    }
    .page-link {
      cursor: pointer;
    }
  `]
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  usersPage: Page<UserResponse> | null = null;
  selectedUserIds: string[] = [];
  currentSort: SortOption = 'createdAt';
  currentSearchTerm: string = '';
  allSelected: boolean = false;

  ngOnInit(): void {
    this.loadUsers(0);
    this.userService.selectedUsers$.subscribe(ids => {
      this.selectedUserIds = ids;
      this.updateAllSelectedState();
    });
  }

  loadUsers(page: number = 0, size: number = 20): void {
    this.userService.getUsersByRoleAndEstablishment(page, size, this.currentSort)
        .subscribe({
          next: (page) => {
            this.usersPage = page;
            this.updateAllSelectedState();
          },
          error: (err) => console.error('Error loading users', err)
        });
  }

  loadPage(page: number): void {
    if (page >= 0 && page < (this.usersPage?.totalPages || 0)) {
      this.loadUsers(page);
    }
  }

  getPages(): number[] {
    if (!this.usersPage) return [];
    const totalPages = this.usersPage.totalPages;
    const currentPage = this.usersPage.number;

    let start = Math.max(0, currentPage - 2);
    let end = Math.min(totalPages - 1, currentPage + 2);

    if (currentPage <= 2) {
      end = Math.min(4, totalPages - 1);
    }

    if (currentPage >= totalPages - 3) {
      start = Math.max(totalPages - 5, 0);
    }

    return Array.from({length: end - start + 1}, (_, i) => start + i);
  }

  onSortChange(sortOption: SortOption): void {
    this.currentSort = sortOption;
    this.loadUsers(0);
  }

  onSearchChange(searchTerm: string): void {
    this.currentSearchTerm = searchTerm;
    // Implémentez la recherche si nécessaire
  }

  toggleUserSelection(userId: string): void {
    this.userService.toggleUserSelection(userId);
  }

  toggleAllSelection(): void {
    if (!this.usersPage) return;

    if (this.allSelected) {
      this.userService.clearSelection();
    } else {
      this.userService.clearSelection();
      this.usersPage.content.forEach(user => {
        this.userService.toggleUserSelection(user.id);
      });
    }
  }

  updateAllSelectedState(): void {
    if (!this.usersPage) {
      this.allSelected = false;
      return;
    }
    this.allSelected = this.usersPage.content.length > 0 &&
        this.usersPage.content.every(user => this.selectedUserIds.includes(user.id));
  }

  deleteUser(userId: string): void {
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.toastService.show('User deleted successfully', 'success');
        this.loadUsers(this.usersPage?.number || 0);
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.toastService.show('Error deleting user', 'danger');
      }
    });
  }

  getPaginationText(): string {
    if (!this.usersPage) return '';

    const start = (this.usersPage.number * this.usersPage.size) + 1;
    const end = (this.usersPage.number * this.usersPage.size) + this.usersPage.content.length;

    return `Showing ${start}-${end} of ${this.usersPage.totalElements} users`;
  }
}