import {Component, Input, OnInit} from '@angular/core';
import {UserResponse} from "../../../users/users.models";
import {UserService} from "../../../users/services/user.service";
import {ClassServiceService} from "../../../services/class-service.service";
import {FormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {CommonModule, NgIf} from "@angular/common";
import {DepartmentService} from "../../../department/department.service";
import {SubDepartmentService} from "../../../department/sub-department.service";
import {ThirdLevelDepartmentService} from "../../../department/third-level-department.service";

interface StructureItem {
  id: string;
  name: string;
  type: 'department' | 'subDepartment' | 'thirdLevel';
}

@Component({
  selector: 'app-class-stats-cards',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf
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
  showStructureModal = false;
  searchQuery = '';
  allUsers: UserResponse[] = [];
  filteredUsers: UserResponse[] = [];
  selectedUsers: UserResponse[] = [];
  structureItems: StructureItem[] = [];
  selectedStructure: StructureItem | null = null;

  constructor(
      private userService: UserService,
      private classService: ClassServiceService,
      private departmentService: DepartmentService,
      private subDepartmentService: SubDepartmentService,
      private thirdLevelDepartmentService: ThirdLevelDepartmentService,
      private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEstablishmentUsers();
    this.loadStructureItems();
  }

  toggleOptionsMenu(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.showOptionsMenu = !this.showOptionsMenu;

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

  openEditClass(): void {
    this.showOptionsMenu = false;
    this.router.navigate(['/class-services/edit', this.classId]);
  }

  openAddUserModal(): void {
    this.showOptionsMenu = false;
    this.showAddUserModal = true;
    this.selectedUsers = [];
  }

  closeAddUserModal(): void {
    this.showAddUserModal = false;
    this.selectedUsers = [];
    this.searchQuery = '';
    this.filteredUsers = [...this.allUsers];
  }

  openStructureModal(): void {
    this.showOptionsMenu = false;
    this.showStructureModal = true;
    this.selectedStructure = null;
  }

  closeStructureModal(): void {
    this.showStructureModal = false;
    this.selectedStructure = null;
  }

  loadEstablishmentUsers(): void {
    this.userService.getCurrentUser().subscribe(currentUser => {
      if (currentUser.establishmentId) {
        this.userService.getUsersByEstablishmentId(currentUser.establishmentId)
            .subscribe(response => {
              this.allUsers = response.content;
              this.filteredUsers = [...this.allUsers];
            });
      }
    });
  }

  loadStructureItems(): void {
    this.userService.getCurrentUser().subscribe(currentUser => {
      if (currentUser.establishmentId) {
        // Charger les départements
        this.departmentService.getAllMyDepartments()
            .subscribe(departments => {
              departments.forEach(dept => {
                this.structureItems.push({
                  id: dept.id,
                  name: dept.title,
                  type: 'department'
                });
              });
            });

        // Charger les sous-départements
        this.subDepartmentService.getAllSubDepartmentsByConnectedUser()
            .subscribe(subDepts => {
              subDepts.forEach(subDept => {
                this.structureItems.push({
                  id: subDept.id,
                  name: subDept.title,
                  type: 'subDepartment'
                });
              });
            });

        // Charger les départements de troisième niveau
        this.thirdLevelDepartmentService.getAllThirdLevelDepartmentsByConnectedUser()
            .subscribe(thirdLevels => {
              thirdLevels.forEach(thirdLevel => {
                this.structureItems.push({
                  id: thirdLevel.id,
                  name: thirdLevel.title,
                  type: 'thirdLevel'
                });
              });
            });
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

  toggleUserSelection(user: UserResponse): void {
    const index = this.selectedUsers.findIndex(u => u.id === user.id);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(user);
    }
  }

  isUserSelected(user: UserResponse): boolean {
    return this.selectedUsers.some(u => u.id === user.id);
  }

  selectStructure(structure: StructureItem): void {
    this.selectedStructure = structure;
  }

  getInitials(user: UserResponse): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  getStructureTypeLabel(type: string): string {
    switch(type) {
      case 'department': return 'Département';
      case 'subDepartment': return 'Sous-département';
      case 'thirdLevel': return 'Troisième niveau';
      default: return type;
    }
  }

  confirmAddUsers(): void {
    if (this.selectedUsers.length > 0 && this.classId) {
      const userIds = this.selectedUsers.map(user => user.id);

      // Utiliser la méthode pour ajouter plusieurs utilisateurs si elle existe
      // Sinon, utiliser la méthode existante pour chaque utilisateur
      if (typeof (this.userService as any).addMultipleUsersToClassService === 'function') {
        (this.userService as any).addMultipleUsersToClassService(userIds, this.classId)
            .subscribe({
              next: () => {
                alert(`${this.selectedUsers.length} utilisateur(s) ajouté(s) avec succès`);
                this.closeAddUserModal();
              },
              error: (err: any) => {
                console.error('Erreur lors de l\'ajout des utilisateurs:', err);
                alert('Échec de l\'ajout des utilisateurs');
              }
            });
      } else {
        // Fallback: appeler la méthode existante pour chaque utilisateur
        const addUserPromises = userIds.map(userId =>
            this.userService.addUserToClassService(userId, this.classId).toPromise()
        );

        Promise.all(addUserPromises)
            .then(() => {
              alert(`${this.selectedUsers.length} utilisateur(s) ajouté(s) avec succès`);
              this.closeAddUserModal();
            })
            .catch(err => {
              console.error('Erreur lors de l\'ajout des utilisateurs:', err);
              alert('Échec de l\'ajout des utilisateurs');
            });
      }
    }
  }

  confirmStructureAssociation(): void {
    if (this.selectedStructure && this.classId) {
      let serviceCall;

      switch(this.selectedStructure.type) {
        case 'department':
          serviceCall = this.classService.addClassServiceToDepartment(
              this.selectedStructure.id,
              this.classId
          );
          break;
        case 'subDepartment':
          serviceCall = this.classService.addClassServiceToSubDepartment(
              this.selectedStructure.id,
              this.classId
          );
          break;
        case 'thirdLevel':
          serviceCall = this.classService.addClassServiceToThirdLevelDepartment(
              this.selectedStructure.id,
              this.classId
          );
          break;
        default:
          return;
      }

      serviceCall.subscribe({
        next: () => {
          alert('Classe associée avec succès au niveau de structure');
          this.closeStructureModal();
        },
        error: (err) => {
          console.error('Erreur lors de l\'association:', err);
          alert('Échec de l\'association');
        }
      });
    }
  }
}