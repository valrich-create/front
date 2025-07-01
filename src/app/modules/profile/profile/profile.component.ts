import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { Router } from '@angular/router';
import { UserDetailCardComponent } from "../../base-component/components/user-detail-card/user-detail-card.component";
import { UserResponse, UserRole } from "../../users/users.models";
import { UserService } from "../../users/services/user.service";
import { AdministratorServiceService } from "../../administrators/services/administrator-service.service";
import { Admin } from "../../administrators/admin";
import { ToastService } from "../../base-component/services/toast/toast.service";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, UserDetailCardComponent],
  template: `
    <div *ngIf="loading" class="text-center mt-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <app-user-detail-card
      *ngIf="!loading && userData"
      [user]="userData"
      [isAdmin]="true"
      [pageTitle]="'My Account'"
      [onEdit]="editProfile"
      [onDelete]="deleteProfile"
      [onAssignToClass]="isProfilePage ? changePassword : undefined"
    ></app-user-detail-card>
  `,
  styles: [`
    .profile-actions-container {
      margin-top: 2rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
})
export class ProfileComponent implements OnInit {
  userData: UserResponse | null = null;
  loading = true;
  isProfilePage = true;
  private currentUserRole: UserRole = UserRole.USER;

  constructor(
      private userService: UserService,
      private adminService: AdministratorServiceService,
      private toastService: ToastService,
      private modalService: NgbModal,
      private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeProfile();
  }

  private initializeProfile(): void {
    try {
      const storedUser = this.getStoredUser();
      if (!storedUser) {
        throw new Error('No user data in storage');
      }

      this.currentUserRole = storedUser.role as UserRole;
      this.loadUserProfile();
    } catch (error) {
      this.handleError(error);
    }
  }

  private getStoredUser(): any {
    const userData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
    if (!userData) throw new Error('User data not found');
    return JSON.parse(userData);
  }

  private loadUserProfile(): void {
    if (this.currentUserRole === UserRole.SUPER_ADMIN) {
      this.loadSuperAdminProfile();
    } else {
      this.loadRegularUserProfile();
    }
  }

  private loadSuperAdminProfile(): void {
    this.adminService.getCurrentAdmin().subscribe({ // Changé de getCurrentUser() à getCurrentAdmin()
      next: (admin) => {
        this.userData = this.mapAdminToUserResponse(admin);
        this.loading = false;
      },
      error: (err) => {
        this.handleProfileError(err, true);
      }
    });
  }

  private loadRegularUserProfile(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.userData = user;
        this.loading = false;
      },
      error: (err) => {
        this.handleProfileError(err, false);
      }
    });
  }

  private handleProfileError(error: unknown, isAdmin: boolean): void {
    this.loading = false;

    let errorMessage = `Failed to load ${isAdmin ? 'admin' : 'user'} profile`;

    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
      console.error(errorMessage, error.stack);
    } else if (typeof error === 'string') {
      errorMessage += `: ${error}`;
      console.error(errorMessage);
    } else {
      console.error(errorMessage, error);
    }

    this.toastService.show(errorMessage, 'danger');
  }

  private mapAdminToUserResponse(admin: UserResponse): UserResponse {
    return {
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      phoneNumber: admin.phoneNumber,
      role: UserRole.SUPER_ADMIN,
      profileImageUrl: "",
      dateOfBirth: admin.dateOfBirth,
      placeOfBirth: admin.placeOfBirth,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
      permissions: admin.permissions || [],
      establishmentId: ''
    };
  }

  editProfile = (): void => {
    if (!this.userData?.id) return;

    const route = this.currentUserRole === UserRole.SUPER_ADMIN
        ? '/admin/edit'
        : '/users/edit';
    this.router.navigate([route, this.userData.id]);
  }

  deleteProfile = (): void => {
    // Implémentez selon vos besoins
  }

  changePassword = (): void => {
    if (!this.userData?.id) return;

    const modalRef = this.modalService.open(ChangePasswordComponent);
    modalRef.componentInstance.userId = this.userData.id;
    modalRef.componentInstance.isAdmin = this.currentUserRole === UserRole.SUPER_ADMIN;
  }

  private handleError(error: unknown ): void {
    this.loading = false;
    let errorMessage = 'An unknown error occurred';

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    console.error('Profile initialization error:', error);
    this.toastService.show('Failed to initialize profile', 'danger');
    // this.router.navigate(['/login']); // Redirige vers login en cas d'erreur grave
  }

}

// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { ChangePasswordComponent } from '../change-password/change-password.component';
// import { Router } from '@angular/router';
// import {UserDetailCardComponent} from "../../base-component/components/user-detail-card/user-detail-card.component";
// import {UserResponse, UserRole} from "../../users/users.models";
// import {UserService} from "../../users/services/user.service";
// import {AdministratorServiceService} from "../../administrators/services/administrator-service.service";
// import {Admin} from "../../administrators/admin";
// import {ToastService} from "../../base-component/services/toast/toast.service";
//
// @Component({
//   selector: 'app-profile',
//   standalone: true,
//   imports: [CommonModule, UserDetailCardComponent],
//   template: `
//     <app-user-detail-card
//       [user]="user!"
//       [isAdmin]="true"
//       [pageTitle]="'My Account'"
//       [onEdit]="editProfile"
//       [onDelete]="deleteProfile"
//       [onAssignToClass]="isProfilePage ? changePassword : undefined"
//     ></app-user-detail-card>
//   `,
//   styles: [`
//     .profile-actions-container {
//       margin-top: 2rem;
//       padding: 1rem;
//       background: white;
//       border-radius: 8px;
//       box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//     }
//   `]
// })
// export class ProfileComponent implements OnInit {
//   user: UserResponse | undefined;
//   admin: Admin | undefined;
//   isProfilePage = true;
//   private currentUserRole: UserRole = UserRole.SUPER_ADMIN;
//
//   constructor(
//       private userService: UserService,
//       private adminService: AdministratorServiceService,
//       private toastService: ToastService,
//       private modalService: NgbModal,
//       private router: Router
//   ) {}
//
//   ngOnInit(): void {
//     this.loadCurrentUser();
//   }
//
//   private getCurrentUserRole(): void {
//     const storedRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
//     if (storedRole && Object.values(UserRole).includes(storedRole as UserRole)) {
//       this.currentUserRole = storedRole as UserRole;
//     }
//   }
//
//   private loadCurrentUser(): void {
//     if (this.currentUserRole === UserRole.SUPER_ADMIN) {
//       this.loadSuperAdminProfile();
//     } else {
//       this.loadRegularUserProfile();
//     }
//   }
//
//   private loadSuperAdminProfile(): void {
//     this.adminService.getCurrentUser().subscribe({
//       next: (admin) => {
//         this.admin = {
//           ...admin,
//           // Mapper les champs si nécessaire entre admin et user response
//           role: UserRole.SUPER_ADMIN
//         };
//       },
//       error: (err) => {
//         this.toastService.show('Error occurred', 'danger');
//         console.error('Failed to load super admin profile', err);
//         // Fallback au service user si nécessaire
//         this.loadRegularUserProfile();
//       }
//     });
//   }
//
//   private loadRegularUserProfile(): void {
//     this.userService.getCurrentUser().subscribe({
//       next: (user) => this.user = user,
//       error: (err) => {
//         this.toastService.show('Error occurred', 'danger');
//         console.error('Failed to load current user', err)
//       }
//     });
//   }
//
//   // private loadCurrentUser(): void {
//   //   this.userService.getCurrentUser().subscribe({
//   //     next: (user) => this.user = user,
//   //     error: () => console.error('Failed to load current user')
//   //   });
//   // }
//
//   editProfile = (): void => {
//     if (this.user?.id) {
//       if (this.currentUserRole === UserRole.SUPER_ADMIN) {
//         this.router.navigate(['/admin/edit', this.user.id]);
//       } else {
//         this.router.navigate(['/users/edit', this.user.id]);
//       }
//     }
//   }
//
//   // deleteProfile = (): void => {
//   //   // Implémentation de la suppression selon le rôle
//   //   if (this.user?.id) {
//   //     const confirmDelete = confirm('Are you sure you want to delete your profile?');
//   //     if (confirmDelete) {
//   //       if (this.currentUserRole === UserRole.SUPER_ADMIN) {
//   //         this.adminService.deleteAdmin(this.user.id).subscribe({
//   //           next: () => {
//   //             alert('Admin profile deleted successfully');
//   //             this.logout();
//   //           },
//   //           error: (err) => console.error('Error deleting admin profile', err)
//   //         });
//   //       } else {
//   //         this.userService.deleteUser(this.user.id).subscribe({
//   //           next: () => {
//   //             alert('User profile deleted successfully');
//   //             this.logout();
//   //           },
//   //           error: (err) => console.error('Error deleting user profile', err)
//   //         });
//   //       }
//   //     }
//   //   }
//   // }
//   //
//
//   deleteProfile = (): void => {}
//
//   changePassword = (): void => {
//     const modalRef = this.modalService.open(ChangePasswordComponent);
//     modalRef.componentInstance.userId = this.user?.id;
//     modalRef.componentInstance.isAdmin = this.currentUserRole === UserRole.SUPER_ADMIN;
//   }
//
//
// }