import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {NavbarComponent} from "../../../base-component/components/navbar/navbar.component";
import {SearchBarComponent} from "../../../base-component/components/search-bar/search-bar.component";
import {UserRowComponent} from "../../components/user-row/user-row.component";
import {UserService} from "../../services/user.service";
import {ToastService} from "../../../base-component/services/toast/toast.service";
import {SortOption, User} from "../../users.models";
import {LayoutComponent} from "../../../base-component/components/layout/layout.component";

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SearchBarComponent, UserRowComponent, LayoutComponent],
  template: `
    <app-layout>
      <div class="container-fluid p-0">
        <app-navbar
            pageTitle="Users"
            userName="Nabila A."
            userRole="Admin"
            userInitials="NA">
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

            <div class="d-none d-md-block text-center" style="width: 120px;">
              <strong>Class</strong>
            </div>

            <div class="d-none d-md-block text-center" style="width: 80px;">
              <strong>Age</strong>
            </div>

            <div class="d-none d-lg-block text-center" style="width: 100px;">
              <strong>City</strong>
            </div>

            <div class="text-center" style="width: 80px;">
              <strong>Contact</strong>
            </div>

            <div class="text-center" style="width: 100px;">
              <strong>Function</strong>
            </div>

            <div style="width: 40px;">
              <strong>Action</strong>
            </div>
          </div>

          <!-- User Rows -->
          <div class="user-list">
            <app-user-row
                *ngFor="let user of users"
                [user]="user"
                [isSelected]="selectedUserIds.includes(user.id)"
                (toggleSelect)="toggleUserSelection($event)"
                (delete)="deleteUser($event)"
                (showPhone)="showPhoneNumber($event)">
            </app-user-row>
          </div>

          <!-- Pagination -->
          <div class="d-flex justify-content-between align-items-center py-3">
            <div class="text-muted">
              Showing 1-{{ users.length }} from {{ totalUsers }} data
            </div>

            <nav aria-label="User pagination">
              <ul class="pagination mb-0">
                <li class="page-item">
                  <a class="page-link" href="#" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                  </a>
                </li>
                <li class="page-item active"><a class="page-link" href="#">1</a></li>
                <li class="page-item"><a class="page-link" href="#">2</a></li>
                <li class="page-item"><a class="page-link" href="#">3</a></li>
                <li class="page-item">
                  <a class="page-link" href="#" aria-label="Next">
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
  `]
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  users: User[] = [];
  selectedUserIds: string[] = [];
  totalUsers: number = 100;
  currentSort: SortOption = 'newest';
  currentSearchTerm: string = '';
  allSelected: boolean = false;

  ngOnInit(): void {
    this.loadUsers();

    this.userService.selectedUsers$.subscribe(ids => {
      this.selectedUserIds = ids;
      this.updateAllSelectedState();
    });
  }

  loadUsers(): void {
    this.userService.getUsers(this.currentSearchTerm, this.currentSort)
        .subscribe(users => {
          this.users = users;
          this.updateAllSelectedState();
        });
  }

  onSortChange(sortOption: SortOption): void {
    this.currentSort = sortOption;
    this.loadUsers();
  }

  onSearchChange(searchTerm: string): void {
    this.currentSearchTerm = searchTerm;
    this.loadUsers();
  }

  toggleUserSelection(userId: string): void {
    this.userService.toggleUserSelection(userId);
  }

  toggleAllSelection(): void {
    if (this.allSelected) {
      this.userService.clearSelection();
    } else {
      // Sélectionner tous les utilisateurs actuellement affichés
      this.userService.clearSelection();
      this.users.forEach(user => {
        this.userService.toggleUserSelection(user.id);
      });
    }
  }

  updateAllSelectedState(): void {
    this.allSelected = this.users.length > 0 &&
        this.users.every(user => this.selectedUserIds.includes(user.id));
  }

  deleteUser(userId: string): void {
    this.userService.deleteUser(userId).subscribe(success => {
      if (success) {
        this.users = this.users.filter(user => user.id !== userId);
        this.toastService.show('Utilisateur supprimé avec succès', 'success');
      } else {
        this.toastService.show('Erreur lors de la suppression de l\'utilisateur', 'danger');
      }
    });
  }

  showPhoneNumber(data: {id: string, phone: string}): void {
    this.toastService.show(`Téléphone: ${data.phone}`, 'info');
  }
}

