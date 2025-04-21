import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../../base-component/components/layout/layout.component';
import { NavbarComponent } from '../../../base-component/components/navbar/navbar.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {User} from "../../users.models";
import {
  UserDetailsAttendanceModalComponent
} from "../../components/user-details-attendance-modal/user-details-attendance-modal.component";

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, LayoutComponent, NavbarComponent],
  template: `
    <app-layout>
      <div class="container-fluid p-0">
        <app-navbar
            pageTitle="Détails Utilisateur"
            userName="Admin"
            userRole="Administrateur"
            userInitials="AD">
        </app-navbar>

        <div class="container py-4">
          <div class="row">
            <!-- Colonne principale (3/4 de l'espace) -->
            <div class="col-lg-9 col-md-8 mb-4">
              <div class="card shadow-sm h-100">
                <div class="card-body">
                  <!-- En-tête avec boutons -->
                  <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
                    <div class="d-flex align-items-center">
                      <div class="avatar me-3">
                        <span class="initials">{{getInitials(user?.name)}}</span>
                      </div>
                      <div>
                        <h2 class="mb-1">{{user?.name}}</h2>
                        <p class="text-muted mb-0">{{user?.function}} • {{user?.class}}</p>
                      </div>
                    </div>
                    <div class="mt-2 mt-md-0">
                      <button class="btn btn-primary me-2">
                        <i class="bi bi-pencil-square me-1"></i> Modifier
                      </button>
                      <button class="btn btn-outline-danger">
                        <i class="bi bi-trash me-1"></i> Supprimer
                      </button>
                    </div>
                  </div>

                  <!-- Informations de contact -->
                  <div class="row mb-4">
                    <div class="col-md-6 mb-3">
                      <div class="card h-100">
                        <div class="card-body">
                          <h5 class="card-title">Informations de contact</h5>
                          <ul class="list-unstyled">
                            <li class="mb-2">
                              <i class="bi bi-geo-alt-fill text-primary me-2"></i>
                              {{user?.city}}, {{user?.country}}
                            </li>
                            <li class="mb-2">
                              <i class="bi bi-telephone-fill text-primary me-2"></i>
                              {{user?.phone}}
                            </li>
                            <li class="mb-2">
                              <i class="bi bi-envelope-fill text-primary me-2"></i>
                              {{user?.email}}
                            </li>
                            <li *ngIf="user?.parentName">
                              <i class="bi bi-person-vcard-fill text-primary me-2"></i>
                              Parent: {{user?.parentName}}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="card h-100">
                        <div class="card-body">
                          <h5 class="card-title">Informations générales</h5>
                          <ul class="list-unstyled">
                            <li class="mb-2">
                              <i class="bi bi-calendar-event text-primary me-2"></i>
                              <strong>Âge:</strong> {{user?.age}} ans
                            </li>
                            <li class="mb-2">
                              <i class="bi bi-building text-primary me-2"></i>
                              <strong>Organisation:</strong> {{user?.organization}}
                            </li>
                            <li class="mb-2">
                              <i class="bi bi-calendar-plus text-primary me-2"></i>
                              <strong>Date création:</strong> {{user?.dateCreated | date:'mediumDate'}}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Section À propos -->
                  <div class="card mb-4">
                    <div class="card-body">
                      <h5 class="card-title">À propos</h5>
                      <p class="card-text">
                        {{user?.bio || 'Aucune biographie disponible.'}}
                      </p>
                    </div>
                  </div>

                  <!-- Éducation et Expertise -->
                  <div class="row">
                    <div class="col-md-6 mb-3 mb-md-0">
                      <div class="card h-100">
                        <div class="card-body">
                          <h5 class="card-title">Formation</h5>
                          <ul class="list-unstyled">
                            <li class="mb-3" *ngFor="let edu of user?.education">
                              <h6 class="mb-1">{{edu.degree}}</h6>
                              <p class="text-muted mb-0">{{edu.institution}} ({{edu.yearFrom}} - {{edu.yearTo}})</p>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="card h-100">
                        <div class="card-body">
                          <h5 class="card-title">Expertise</h5>
                          <div class="d-flex flex-wrap gap-2">
                            <span class="badge bg-primary" *ngFor="let skill of user?.expertise">
                              {{skill}}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Colonne secondaire (1/4 de l'espace) -->
            <div class="col-lg-3 col-md-4">
              <!-- Calendrier de présence -->
              <div class="card mb-4">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0">Présence</h5>
                    <button class="btn btn-sm btn-outline-primary" (click)="openAttendanceModal()">
                      Voir plus
                    </button>
                  </div>
                  
                  <div class="attendance-calendar">
                    <div class="calendar-header">
                      <span *ngFor="let day of ['L', 'M', 'M', 'J', 'V', 'S', 'D']">{{day}}</span>
                    </div>
                    <div class="calendar-days">
                      <span *ngFor="let day of calendarDays" 
                            class="day"
                            [class.present]="day.status === 'present'"
                            [class.absent]="day.status === 'absent'"
                            [class.partial]="day.status === 'partial'">
                        {{day.day}}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Lieux de pointage -->
              <div class="card">
                <div class="card-body">
                  <h5 class="mb-3">Lieux de pointage</h5>
                  <div class="locations-list">
                    <div *ngFor="let location of user?.checkInLocations" class="location-item">
                      <div class="d-flex justify-content-between">
                        <div>
                          <strong>{{location.name}}</strong>
                          <div class="text-muted small">
                            Dernier pointage: {{location.lastCheckIn | date:'shortDate'}}
                          </div>
                        </div>
                        <span class="badge" 
                              [class.bg-success]="location.status === 'active'"
                              [class.bg-secondary]="location.status === 'inactive'">
                          {{location.status === 'active' ? 'Actif' : 'Inactif'}}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: #4e3aa7;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 1.5rem;
    }

    .attendance-calendar {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }

    .calendar-header {
      display: contents;
      font-weight: bold;
      font-size: 0.8rem;
      text-align: center;
    }

    .calendar-header span {
      padding: 4px 0;
    }

    .calendar-days {
      display: contents;
    }

    .day {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
    }

    .day.present {
      background-color: #a3ffab;
    }

    .day.absent {
      background-color: #ffabab;
    }

    .day.partial {
      background-color: #fff6a5;
    }

    .locations-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .location-item {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .location-item:last-child {
      border-bottom: none;
    }

    @media (max-width: 992px) {
      .col-lg-9, .col-lg-3 {
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .container {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }
  `]
})
export class UserDetailsComponent {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private modalService = inject(NgbModal);

  user: User | undefined ;
  calendarDays: any[] = [];

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUser(userId);
    }
    this.generateSampleCalendar();
  }

  loadUser(id: string): void {
    this.userService.getUserById(id).subscribe({
      next: (user) => this.user = user,
      error: () => console.error('Failed to load user')
    });
  }

  getInitials(name?: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  openAttendanceModal() {
    const modalRef = this.modalService.open(UserDetailsAttendanceModalComponent, { size: 'lg' });
    modalRef.componentInstance.attendanceRecords = this.user?.attendanceRecords || [];
  }

  private generateSampleCalendar() {
    // Génère un calendrier de démonstration
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    // Ajoute les jours du mois avec des statuts aléatoires
    for (let i = 1; i <= daysInMonth; i++) {
      const rand = Math.random();
      this.calendarDays.push({
        day: i,
        status: rand > 0.7 ? 'absent' : (rand > 0.9 ? 'partial' : 'present')
      });
    }
  }
}

// import {Component, inject} from '@angular/core';
// import {ActivatedRoute, RouterModule} from "@angular/router";
// import { UserService } from '../../services/user.service';
// import {ToastService} from "../../../base-component/services/toast/toast.service";
// import {User} from "../../users.models";
// import {CommonModule} from "@angular/common";
// import {LayoutComponent} from "../../../base-component/components/layout/layout.component";
// import {NavbarComponent} from "../../../base-component/components/navbar/navbar.component";
// import {SidebarComponent} from "../../../base-component/components/sidebar/sidebar.component";
//
// @Component({
//   selector: 'app-user-details',
//   standalone: true,
//   imports: [CommonModule, RouterModule, LayoutComponent, NavbarComponent],
//   template: `
//     <app-layout>
//       <div class="container-fluid p-0">
//         <app-navbar
//             pageTitle="User Details"
//             userName="Nabila A."
//             userRole="Admin"
//             userInitials="NA">
//         </app-navbar>
//
//         <div class="px-4 py-3">
//           <div class="row">
//
//
//             <!-- Contenu principal -->
//             <div class="col-lg-9">
//               <div class="card shadow-sm">
//                 <div class="card-body">
//                   <!-- En-tête -->
//                   <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
//                     <div>
//                       <h2 class="mb-1">{{user?.name}}</h2>
//                       <p class="text-muted mb-0">{{user?.function}}</p>
//                     </div>
//                     <div class="mt-2 mt-md-0">
//                       <button class="btn btn-primary me-2" [routerLink]="['/users/edit', user?.id]">
//                         <i class="bi bi-pencil-square me-1"></i> Edit
//                       </button>
//                       <button class="btn btn-outline-danger" (click)="deleteUser(user?.id)">
//                         <i class="bi bi-trash me-1"></i> Delete
//                       </button>
//                     </div>
//                   </div>
//
//                   <!-- Section info de base -->
//                   <div class="row mb-4">
//                     <div class="col-md-6 mb-3 mb-md-0">
//                       <div class="card h-100">
//                         <div class="card-body">
//                           <h5 class="card-title">Contact Information</h5>
//                           <ul class="list-unstyled">
//                             <li class="mb-2">
//                               <i class="bi bi-geo-alt-fill text-primary me-2"></i>
//                               {{user?.city}}, {{user?.country}}
//                             </li>
//                             <li class="mb-2">
//                               <i class="bi bi-telephone-fill text-primary me-2"></i>
//                               {{user?.phone}}
//                             </li>
//                             <li>
//                               <i class="bi bi-envelope-fill text-primary me-2"></i>
//                               {{user?.email}}
//                             </li>
//                           </ul>
//                         </div>
//                       </div>
//                     </div>
//                     <div class="col-md-6">
//                       <div class="card h-100">
//                         <div class="card-body">
//                           <h5 class="card-title">Basic Information</h5>
//                           <ul class="list-unstyled">
//                             <li class="mb-2">
//                               <i class="bi bi-calendar-event text-primary me-2"></i>
//                               <strong>Date Created:</strong> {{user?.dateCreated | date}}
//                             </li>
//                             <li class="mb-2">
//                               <i class="bi bi-person-badge text-primary me-2"></i>
//                               <strong>ID:</strong> {{user?.id}}
//                             </li>
//                             <li class="mb-2">
//                               <i class="bi bi-building text-primary me-2"></i>
//                               <strong>Organization:</strong> {{user?.organization}}
//                             </li>
//                           </ul>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//
//                   <!-- Section About -->
//                   <div class="card mb-4">
//                     <div class="card-body">
//                       <h5 class="card-title">About</h5>
//                       <p class="card-text">
//                         {{user?.bio || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}}
//                       </p>
//                     </div>
//                   </div>
//
//                   <!-- Sections éducation et expertise -->
//                   <div class="row">
//                     <div class="col-md-6 mb-3 mb-md-0">
//                       <div class="card h-100">
//                         <div class="card-body">
//                           <h5 class="card-title">Education</h5>
//                           <ul class="list-unstyled">
//                             <li class="mb-3" *ngFor="let edu of user?.education">
//                               <h6 class="mb-1">{{edu.degree}}</h6>
//                               <p class="text-muted mb-0">{{edu.institution}} ({{edu.yearFrom}} - {{edu.yearTo}})</p>
//                             </li>
//                           </ul>
//                         </div>
//                       </div>
//                     </div>
//                     <div class="col-md-6">
//                       <div class="card h-100">
//                         <div class="card-body">
//                           <h5 class="card-title">Expertise</h5>
//                           <div class="d-flex flex-wrap gap-2">
//                             <span class="badge bg-primary" *ngFor="let skill of user?.expertise">
//                               {{skill}}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </app-layout>
//   `,
//   styles: [`
//     .card {
//       border-radius: 0.5rem;
//     }
//     .list-unstyled li {
//       padding: 0.5rem 0;
//       border-bottom: 1px solid #eee;
//     }
//     .list-unstyled li:last-child {
//       border-bottom: none;
//     }
//     @media (max-width: 768px) {
//       .px-4 {
//         padding-left: 1rem !important;
//         padding-right: 1rem !important;
//       }
//     }
//   `]
// })
// export class UserDetailsComponent {
//   private route = inject(ActivatedRoute);
//   private userService = inject(UserService);
//   private toastService = inject(ToastService);
//
//   user: User | undefined;
//
//   ngOnInit(): void {
//     const userId = this.route.snapshot.paramMap.get('id');
//     if (userId) {
//       this.loadUser(userId);
//     }
//   }
//
//   loadUser(id: string): void {
//     this.userService.getUserById(id).subscribe({
//       next: (user) => this.user = user,
//       error: () => this.toastService.show('Failed to load user', 'danger')
//     });
//   }
//
//   deleteUser(id?: string): void {
//     if (id && confirm('Are you sure you want to delete this user?')) {
//       this.userService.deleteUser(id).subscribe({
//         next: () => {
//           this.toastService.show('User deleted successfully', 'success');
//           // Rediriger vers la liste après suppression
//         },
//         error: () => this.toastService.show('Failed to delete user', 'danger')
//       });
//     }
//   }
// }
