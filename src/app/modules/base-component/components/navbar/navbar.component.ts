import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {AuthService} from "../../../auth/service/auth.service";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="d-flex justify-content-between align-items-center py-3 px-4 border-bottom">
      <h2 class="m-0">{{ pageTitle }}</h2>
      <div class="d-flex align-items-center">
        <button class="btn btn-link position-relative">
          <i class="bi bi-bell-fill fs-5"></i>
          <span class="position-absolute top-0 start-100 translate-middle p-1 bg-danger rounded-circle">
            <span class="visually-hidden">Nouvelles notifications</span>
          </span>
        </button>
        <button class="btn btn-link ms-3">
          <i class="bi bi-gear-fill fs-5"></i>
        </button>
        <div class="ms-3 d-flex align-items-center">
          <span class="me-2 d-none d-md-block">
            <strong>{{ userName }}</strong>
            <br>
            <small class="text-muted">{{ userRole }}</small>
          </span>
          <div class="avatar rounded-circle bg-primary text-white d-flex justify-content-center align-items-center"
               style="width: 45px; height: 45px;">
            {{ userInitials }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btn-link {
      color: #6c757d;
      text-decoration: none;
    }
    .btn-link:hover {
      color: #343a40;
    }
    .avatar {
      font-weight: bold;
    }
  `]

})

export class NavbarComponent implements OnInit {
  @Input() pageTitle: string = '';
  userName: string = '';
  userRole: string = '';
  userInitials: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userName = `${user.firstName} ${user.lastName}`;
      this.userRole = user.role;
      this.userInitials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
  }
}
