import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministratorServiceService } from '../../services/administrator-service.service';
import { Admin } from '../../admin';
import {NavbarComponent} from "../../../base-component/components/navbar/navbar.component";
import {LayoutComponent} from "../../../base-component/components/layout/layout.component";

@Component({
  selector: 'app-administrator-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    LayoutComponent
  ],
  templateUrl: 'admin-details.component.html',
  styleUrls: ['admin-details.component.scss']
})
export class AdminDetailsComponent implements OnInit {
  administrator!: Admin;
  isLoading: boolean = true;

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private adminService: AdministratorServiceService
  ) {}

  ngOnInit(): void {
    const adminId = this.route.snapshot.paramMap.get('id');
    if (adminId) {
      this.loadAdministratorData(adminId);
    }
  }

  loadAdministratorData(id: string): void {
    this.adminService.getAdministratorById(id).subscribe({
      next: (admin) => {
        this.administrator = admin;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading administrator', err);
        this.isLoading = false;
        // Gérer l'erreur (redirection ou message)
      }
    });
  }

  editAdministrator(): void {
    this.router.navigate(['/administrators/edit', this.administrator.id]);
  }

  deleteAdministrator(): void {
    if (confirm('Are you sure you want to delete this administrator?')) {
      this.adminService.deleteAdministrator(this.administrator.id).subscribe({
        next: () => {
          this.router.navigate(['/administrators']);
        },
        error: (err) => {
          console.error('Error deleting administrator', err);
        }
      });
    }
  }
}