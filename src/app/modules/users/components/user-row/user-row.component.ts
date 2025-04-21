import {Component, Input, EventEmitter, Output} from '@angular/core';
import {User} from "../../users.models";
import {CommonModule, DatePipe} from "@angular/common";
import {RouterModule} from "@angular/router";

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
          <img *ngIf="user.profilePicture" [src]="user.profilePicture" class="rounded-circle w-100 h-100" alt="{{ user.name }}">
          <span *ngIf="!user.profilePicture" class="text-primary">{{ getInitials(user.name) }}</span>
        </div>
      </div>
      
      <div class="user-info flex-grow-1" [routerLink]="['/users', user.id]" style="cursor: pointer;">
        <h6 class="mb-0">{{ user.name }}</h6>
      </div>
      
      <div class="user-id text-muted d-none d-md-block text-center" style="width: 120px;">{{ user.id }}</div>
      
      <div class="user-date text-muted d-none d-md-block text-center" style="width: 120px;">
        {{ user.dateCreated | date:'MMM dd, yyyy' }}
      </div>
      
      <div class="user-class text-muted d-none d-md-block text-center" style="width: 120px;">{{ user.class }}</div>
      
      <div class="user-age text-muted d-none d-md-block text-center" style="width: 80px;">{{ user.age }}</div>
      
      <div class="user-city text-muted d-none d-lg-block text-center" style="width: 100px;">{{ user.city }}</div>
      
      <div class="user-contacts d-flex justify-content-center" style="width: 80px;">
        <button class="btn btn-sm btn-link" (click)="onShowPhone($event)">
          <i class="bi bi-telephone-fill"></i>
        </button>
        <button class="btn btn-sm btn-link">
          <i class="bi bi-envelope-fill"></i>
        </button>
      </div>
      
      <div class="user-function text-center" style="width: 100px;">
        <span class="badge" 
              [ngClass]="{
                'bg-danger': user.function === 'Délégué',
                'bg-primary': user.function === 'Délégué adjoint',
                'bg-warning text-dark': user.function === 'Utilisateur'
              }">
          {{ getFunctionShortName(user.function) }}
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
  `]
})
export class UserRowComponent {
  @Input() user!: User;
  @Input() isSelected: boolean = false;

  @Output() toggleSelect = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() showPhone = new EventEmitter<{id: string, phone: string}>();

  getInitials(name: string): string {
    return name.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
  }

  getFunctionShortName(functionName: string): string {
    switch(functionName) {
      case 'Délégué': return 'VII A';
      case 'Délégué adjoint': return 'VII C';
      case 'Utilisateur': return 'VII B';
      default: return 'VII B';
    }
  }

  onToggleSelect(): void {
    this.toggleSelect.emit(this.user.id);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.user.name} ?`)) {
      this.delete.emit(this.user.id);
    }
  }

  onShowPhone(event: Event): void {
    event.stopPropagation();
    this.showPhone.emit({id: this.user.id, phone: this.user.phone});
  }
}
