import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../../base-component/components/layout/layout.component';
import { NavbarComponent } from '../../../base-component/components/navbar/navbar.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserDetailsAttendanceModalComponent } from "../../components/user-details-attendance-modal/user-details-attendance-modal.component";
import { UserResponse } from "../../users.models";
import { ConfirmDialogComponent } from "../../../base-component/components/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, LayoutComponent, NavbarComponent, NavbarComponent],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private modalService = inject(NgbModal);

  user: UserResponse | undefined;
  calendarDays: any[] = [];

  ngOnInit(): void {
    this.loadUserData();
    this.generateSampleCalendar();
  }

  private loadUserData(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (user) => this.user = user,
        error: () => console.error('Failed to load user')
      });
    }
  }

  editUser(): void {
    if (this.user?.id) {
      this.router.navigate(['/users/edit', this.user.id]);
    }
  }

  deleteUser(): void {
    const modalRef = this.modalService.open(ConfirmDialogComponent);
    modalRef.componentInstance.title = 'Confirmer la suppression';
    modalRef.componentInstance.message = `Êtes-vous sûr de vouloir supprimer l'utilisateur ${this.user?.firstName} ${this.user?.lastName} ?`;

    modalRef.result.then((result) => {
      if (result === 'confirm' && this.user?.id) {
        this.userService.deleteUser(this.user.id).subscribe({
          next: () => this.router.navigate(['/users']),
          error: (err) => console.error('Erreur lors de la suppression', err)
        });
      }
    }).catch(() => {});
  }

  openAttendanceModal(): void {
    const modalRef = this.modalService.open(UserDetailsAttendanceModalComponent, { size: 'lg' });
    // modalRef.componentInstance.attendanceRecords = this.user?.attendanceRecords || [];
  }

  getInitials(name?: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  private generateSampleCalendar(): void {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const rand = Math.random();
      this.calendarDays.push({
        day: i,
        status: rand > 0.7 ? 'absent' : (rand > 0.9 ? 'partial' : 'present')
      });
    }
  }
}