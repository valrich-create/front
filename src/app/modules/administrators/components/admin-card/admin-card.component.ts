import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEllipsisH, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { RouterModule } from "@angular/router";
import {Admin} from "../../admin";

@Component({
  selector: 'app-admin-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule],
  templateUrl: "./admin-card.component.html",
  styleUrls: ['./admin-card.component.scss']
})
export class AdminCardComponent {
  @Input() admin!: Admin;
  @Output() action = new EventEmitter<{ type: string, admin: Admin }>();
  @Output() delete = new EventEmitter<string>();

  faEllipsisH = faEllipsisH;
  faPhone = faPhone;
  faEnvelope = faEnvelope;

  showDropdown = false;
  showMenu = false;

  getInitials(): string {
    return `${this.admin.firstName[0]}${this.admin.lastName[0]}`.toUpperCase();
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  onAction(type: string, event: Event): void {
    event.stopPropagation();
    this.action.emit({ type, admin: this.admin });
    this.showMenu = false;
  }

  callUser(): void {
    console.log('Calling', this.admin.phoneNumber);
  }

  emailUser(): void {
    console.log('Emailing', this.admin.email);
  }

  goToDetails(): void {
    this.action.emit({ type: 'details', admin: this.admin });
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) {
      this.delete.emit(this.admin.id);
    }
    this.showMenu = false;
  }
}



// import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
// import {CommonModule} from "@angular/common";
// import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
// import {faEllipsisH, faPhone, faEnvelope} from '@fortawesome/free-solid-svg-icons';
// import {ActivatedRoute, Router, RouterModule} from "@angular/router";
// import {AdministratorServiceService} from "../../services/administrator-service.service";
//
// @Component({
//   selector: 'app-admin-card',
//   standalone: true,
//   imports: [CommonModule, FontAwesomeModule, RouterModule],
//   templateUrl: "./admin-card.component.html",
//   styleUrls: ['./admin-card.component.scss']
// })
//
// export class AdminCardComponent implements OnInit {
//   @Input() admin: any;
//   @Output() action = new EventEmitter<{type: string, admin: any}>();
//   @Output() delete = new EventEmitter<string>();
//
//   faEllipsisH = faEllipsisH;
//   faPhone = faPhone;
//   faEnvelope = faEnvelope;
//
//   showDropdown = false;
//   showMenu = false;
//
//   // constructor(private router: Router) {}
//
//   constructor(
//       private route: ActivatedRoute,
//       private adminService: AdministratorServiceService
//   ) {}
//
//   getInitials(): string {
//     return this.admin.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
//   }
//
//   toggleDropdown(): void {
//     this.showDropdown = !this.showDropdown;
//   }
//
//   toggleMenu(event: Event): void {
//     event.stopPropagation();
//     this.showMenu = !this.showMenu;
//   }
//
//   onAction(type: string, event: Event): void {
//     event.stopPropagation();
//     this.action.emit({ type, admin: this.admin });
//     this.showMenu = false;
//   }
//
//   callUser(): void {
//     console.log('Calling', this.admin.phone);
//   }
//
//   emailUser(): void {
//     console.log('Emailing', this.admin.email);
//   }
//
//   goToDetails(): void {
//     this.action.emit({ type: 'details', admin: this.admin });
//   }
//
//   onDelete(event: Event): void {
//     event.stopPropagation();
//     if (confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) {
//       this.delete.emit(this.admin.id);
//     }
//     this.showMenu = false;
//   }
//
//   ngOnInit(): void {
//     const id = this.route.snapshot.paramMap.get('id');
//     if (id) {
//       this.admin = this.adminService.getAdminById(id);
//     }
//   }
// }