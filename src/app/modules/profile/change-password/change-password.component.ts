import {Component, inject, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {UserService} from "../../users/services/user.service";
import {AuthService} from "../../auth/service/auth.service";

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Change your password</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <form (ngSubmit)="changePassword()">
        <div class="mb-3">
          <label for="currentPassword" class="form-label">Current password</label>
          <input type="password" class="form-control" id="currentPassword" [(ngModel)]="currentPassword" name="currentPassword" required>
        </div>
        <div class="mb-3">
          <label for="newPassword" class="form-label">New password</label>
          <input type="password" class="form-control" id="newPassword" [(ngModel)]="newPassword" name="newPassword" required>
        </div>
        <div class="mb-3">
          <label for="confirmPassword" class="form-label">Confirm the new password</label>
          <input type="password" class="form-control" id="confirmPassword" [(ngModel)]="confirmPassword" name="confirmPassword" required>
        </div>
        <div class="text-danger mb-3" *ngIf="errorMessage">{{ errorMessage }}</div>
        <div class="text-success mb-3" *ngIf="successMessage">{{ successMessage }}</div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss()">Cancel</button>
          <button type="submit" class="btn btn-primary">Update</button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class ChangePasswordComponent {
  activeModal = inject(NgbActiveModal);
  private authService = inject(AuthService);

  @Input() userId: string | undefined;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';

  changePassword(): void {
    if (!this.userId) {
      this.errorMessage = 'User Not Authenticated';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.authService.changePassword(this.userId, this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.successMessage = 'Password changed successfully';
        setTimeout(() => {
          this.activeModal.close('Success');
        }, 1500);
      },
      error: (err) => {
        this.errorMessage = err.message || 'Error occurred when changing password.';
      }
    });
  }
}