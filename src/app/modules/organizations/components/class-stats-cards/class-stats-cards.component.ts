import {Component, Input, OnInit} from '@angular/core';
import {UserResponse} from "../../../users/users.models";
import {UserService} from "../../../users/services/user.service";
import {ClassServiceService} from "../../../services/class-service.service";
import {FormsModule} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {PointingHourListComponent} from "../../../pointing-hour/page/pointing-hour-list/pointing-hour-list.component";
import {CommonModule, NgIf} from "@angular/common";

@Component({
  selector: 'app-class-stats-cards',
  standalone: true,
  imports: [
      CommonModule,
    FormsModule,
    PointingHourListComponent,
    NgIf,
    RouterLink
  ],
  templateUrl: 'class-stats-cards.component.html',
  styleUrls: ['class-stats-cards.component.scss']
})

export class ClassStatsCardsComponent implements OnInit {
  @Input() totalUsers: number = 0;
  @Input() totalChiefs: number = 0;
  @Input() presenceRate: number = 0;
  @Input() classId: string = '';

  showOptionsMenu = false;
  showAddUserModal = false;
  showPointingHoursModal = false;
  searchQuery = '';
  allUsers: UserResponse[] = [];
  filteredUsers: UserResponse[] = [];
  selectedUser: UserResponse | null = null;

  constructor(
      private userService: UserService,
      private classService: ClassServiceService,
      private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEstablishmentUsers();
  }

  toggleOptionsMenu(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.showOptionsMenu = !this.showOptionsMenu;

    // Fermer le menu quand on clique ailleurs
    if (this.showOptionsMenu) {
      setTimeout(() => {
        const handler = (e: MouseEvent) => {
          const clickedElement = e.target as Element;
          if (!clickedElement.closest('.options-menu')) {
            this.showOptionsMenu = false;
            document.removeEventListener('click', handler);
          }
        };
        document.addEventListener('click', handler);
      });
    }
  }

  private closeMenu(): void {
    this.showOptionsMenu = false;
  }

  openAddUserModal(): void {
    this.showOptionsMenu = false;
    this.showAddUserModal = true;
  }

  closeAddUserModal(): void {
    this.showAddUserModal = false;
    this.selectedUser = null;
    this.searchQuery = '';
    this.filteredUsers = [...this.allUsers];
  }

  loadEstablishmentUsers(): void {
    this.userService.getCurrentUser().subscribe(currentUser => {
      console.log("Current User : " + currentUser);
      if (currentUser.establishmentId) {
        this.userService.getUsersByEstablishmentId(currentUser.establishmentId)
            .subscribe(response => {
              console.log('Users loaded:', response.content); // Debug log
              this.allUsers = response.content;
              this.filteredUsers = [...this.allUsers];
            });
      } else {
        console.warn('No establishmentId for current user'); // Debug log
      }
    });
  }

  searchUsers(): void {
    if (!this.searchQuery) {
      this.filteredUsers = [...this.allUsers];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.allUsers.filter(user =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query)
    );
  }

  selectUser(user: UserResponse): void {
    this.selectedUser = user;
  }

  getInitials(user: UserResponse): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  openPointingZone() {
    this.router.navigate(['/classes', this.classId, 'pointing-zones']);
  }

  get pointingZonesRoute(): string[] {
    return ['/classes', this.classId, 'pointing-zones'];
  }

  openEditClass() {
    this.showOptionsMenu = false;
    this.router.navigate(['/classes', this.classId, 'edit']);
  }

  openPointingHours() {
    this.showOptionsMenu = false;
    this.showPointingHoursModal = true;
    this.router.navigate(['/classes', this.classId, 'pointing-hours']);
  }

  closePointingHours() {
    this.showPointingHoursModal = false;
  }

  confirmAddUser(): void {
    if (this.selectedUser && this.classId) {
      this.userService.addUserToClassService(this.selectedUser.id, this.classId)
          .subscribe({
            next: () => {
              alert('User added successfully to class');
              this.closeAddUserModal();
            },
            error: (err) => {
              console.error('Error adding user to class:', err);
              alert('Failed to add user to class');
            }
          });
    }
  }

}
