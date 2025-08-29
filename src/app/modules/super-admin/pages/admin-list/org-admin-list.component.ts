import {Component, OnInit} from '@angular/core';
import {SortOption, UserResponse} from "../../../users/users.models";
import {Router, RouterLink} from "@angular/router";
import {SearchBarComponent} from "../../../base-component/components/search-bar/search-bar.component";
import {NavbarComponent} from "../../../base-component/components/navbar/navbar.component";
import {LayoutComponent} from "../../../base-component/components/layout/layout.component";
import {NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {UserService} from "../../../users/services/user.service";
import {CommonModule, NgIf} from "@angular/common";
import {debounceTime, distinctUntilChanged, finalize, Subject} from "rxjs";
import {AdminCardComponent} from "../../../administrators/components/admin-card/admin-card.component";

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [
    CommonModule,
    SearchBarComponent,
    NavbarComponent,
    LayoutComponent,
    AdminCardComponent,
    NgbPagination,
    NgIf,
    RouterLink
  ],
  templateUrl: "org-admin-list.component.html",
  styleUrls: ["org-admin-list.component.scss"]
})

export class OrgAdminListComponent implements OnInit {
  totalAdmins = 100;
  currentPage = 1;
  pageSize = 50;
  establishmentId?: string;

  currentSort: SortOption = 'createdAt';
  currentSearchTerm: string = '';
  admins: UserResponse[] | null = null;
  loading = false;
  error: string | null = null;
  private searchTerms = new Subject<string>();

  constructor(private adminService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.getEstablishmentIdFromStorage();
    this.loadAdmins();

    this.searchTerms.pipe(
        debounceTime(300),
        distinctUntilChanged()
    ).subscribe(term => {
      this.currentSearchTerm = term;
      this.loadAdmins();
    });
  }

  loadAdmins(): void {
    console.log('Starting loadAdmins'); // Debug
    this.loading = true;
    this.error = null;
    const backendPage = this.currentPage - 1;

    const establishmentId = this.getEstablishmentIdFromStorage();
    if (!establishmentId) {
      this.error = "No establishment selected";
      this.loading = false;
      return;
    }

    this.adminService.getAdvancedUsersByEstablishment(
        establishmentId,
        backendPage,
        this.pageSize,
        this.currentSort
    ).pipe(
        finalize(() => {
          this.loading = false;
        })
    ).subscribe({
      next: (admins) => {
        this.admins = admins.content;
        this.totalAdmins = admins.totalElements;
      },
      error: (err) => {
        console.error('Error loading data:', err); // Debug
        this.error = "Failed to load administrators";
      }
    });
  }

  getEstablishmentIdFromStorage(): string | null {
    const userData = sessionStorage.getItem('user_data') || localStorage.getItem('user_data');

    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.establishment?.id || null;
      } catch (e) {
        console.error('Error parsing user data from storage', e);
        return null;
      }
    }

    return null;
  }

  handleAction(event: {type: string, admin: any}): void {
    switch(event.type) {
      case 'edit':
        console.log('Edit Super admins', event.admin);
        this.router.navigate(['organization-admin', 'edit', event.admin.id]);
        break;
      case 'delete':
        if(confirm('Are you sure you want to delete this Super admin?')) {
          this.adminService.deleteUser(event.admin.id).subscribe({
            next: () => this.loadAdmins(),
            error: err => console.error('An error occurred when deleting Super admin', err)
          });
        }
        break;
      case 'details':
        console.log('View details', event.admin);
        this.router.navigate(['organization-admin', event.admin.id]);
        break;
    }
  }

  onSortChange(sortOption: SortOption): void {
    this.currentSort = sortOption;
    this.loadAdmins();
  }

  onSearchChange(searchTerm: string): void {
    this.currentSearchTerm = searchTerm;
    this.loadAdmins();
  }

  protected readonly Math = Math;
}
