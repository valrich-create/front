import { Component, Input, EventEmitter, Output } from '@angular/core';
import { UserResponse, UserRole } from "../../users.models";
import { CommonModule, DatePipe } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-user-row',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  template: `
    <div class="user-row d-flex align-items-center py-3 px-3 border-bottom" 
         [class.selected]="isSelected">
      <div class="form-check me-3">
        <input class="form-check-input" type="checkbox" [checked]="isSelected" (change)="onToggleSelect()">
      </div>
      
      <div class="avatar-container me-3">
        <div class="avatar rounded-circle bg-light d-flex justify-content-center align-items-center" 
             style="width: 40px; height: 40px;">
          <span class="text-primary">{{ getInitials(user.firstName + ' ' + user.lastName) }}</span>
        </div>
      </div>
      
      <div class="user-info flex-grow-1" [routerLink]="['/users', user.id]" style="cursor: pointer;">
        <h6 class="mb-0">{{ user.firstName }} {{ user.lastName }}</h6>
        <small class="text-muted">{{ user.email }}</small>
      </div>
      
      <div class="user-id text-muted d-none d-md-block text-center" style="width: 120px;">{{ user.id.substring(0, 8) }}</div>
      
      <div class="user-date text-muted d-none d-md-block text-center" style="width: 120px;">
<!--        {{ user.createdAt | date:'MMM dd, yyyy' || '-' }}-->
        {{ user.createdAt ? (user.createdAt | date:'MMM dd, yyyy') : '-' }}
      </div>
      
      <div class="user-role text-center" style="width: 100px;">
        <span class="badge" 
              [ngClass]="{
                'bg-danger': user.role === UserRole.DELEGATE,
                'bg-primary': user.role === UserRole.ADMIN,
                'bg-warning text-dark': user.role === UserRole.USER
              }">
          {{ user.role || 'USER' }}
        </span>
      </div>
      
      <div class="user-actions dropdown">
        <button class="btn btn-sm btn-link dropdown-toggle" type="button" data-bs-toggle="dropdown">
          <i class="bi bi-three-dots-vertical"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" [routerLink]="['/users', user.id]">Détails</a></li>
          <li><a class="dropdown-item" [routerLink]="['/users/edit', user.id]">Modifier</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" (click)="onDelete($event)">Supprimer</a></li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .user-row:hover {
      background-color: #f8f9fa;
    }
    .selected {
      background-color: #f0f7ff;
    }
    .btn-link {
      color: #6c757d;
      text-decoration: none;
    }
    .btn-link:hover {
      color: #343a40;
    }
    .dropdown-item {
      cursor: pointer;
    }
    .avatar {
      background-color: #e9ecef;
    }
  `]
})
export class UserRowComponent {
  @Input() user!: UserResponse;
  @Input() isSelected: boolean = false;

  @Output() toggleSelect = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  protected readonly UserRole = UserRole;

  getInitials(name: string): string {
    return name.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
  }

  onToggleSelect(): void {
    this.toggleSelect.emit(this.user.id);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.user.firstName} ?`)) {
      this.delete.emit(this.user.id);
    }
  }
}