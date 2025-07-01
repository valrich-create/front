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
import {Admin} from "../../../administrators/admin";

@Component({
  selector: 'app-all-advance-users-list',
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
  templateUrl: "./advance-users-list.component.html",
  styleUrls: ["./advance-users-list.component.scss"],
})
export class AdvanceUsersListComponent implements OnInit {
  totalUsers = 0;
  currentPage = 0;
  pageSize = 15;

  currentSort: SortOption = 'createdAt';
  currentSearchTerm: string = '';
  users: UserResponse[] | null = null;
  loading = false;
  error: string | null = null;
  private searchTerms = new Subject<string>();

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();

    this.searchTerms.pipe(
        debounceTime(300),
        distinctUntilChanged()
    ).subscribe(term => {
      this.currentSearchTerm = term;
      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.userService.getAllAdvancedUsers(
        this.currentPage,
        this.pageSize,
        this.currentSort
    ).pipe(
        finalize(() => {
          this.loading = false;
        })
    ).subscribe({
      next: (users) => {
        this.users = users.content;
        this.totalUsers = users.totalElements;
      },
      error: (err) => {
        this.error = "Failed to load users";
        console.error('Error loading users:', err);
      }
    });
  }

  handleAction(event: {type: string, admin: Admin}): void {
    switch(event.type) {
      case 'edit':
        this.router.navigate(['administrators', 'edit', event.admin.id]);
        break;
      case 'delete':
        if(confirm('Are you sure you want to delete this user?')) {
          this.userService.deleteUser(event.admin.id).subscribe({
            next: () => this.loadUsers(),
            error: err => console.error('Error deleting user:', err)
          });
        }
        break;
      case 'details':
        this.router.navigate(['administrators', event.admin.id]);
        break;
    }
  }

  onSortChange(sortOption: SortOption): void {
    this.currentSort = sortOption;
    this.loadUsers();
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerms.next(searchTerm);
  }

  protected readonly Math = Math;
}