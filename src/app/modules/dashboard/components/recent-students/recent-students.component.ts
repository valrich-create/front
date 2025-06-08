import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { TopUserPresenceResponse, TopEstablishmentByUsersResponse } from "../../../organizations/organization";
import { OrganizationService } from "../../../organizations/organization.service";

@Component({
  selector: 'app-recent-students',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-students.component.html',
  styleUrls: ['./recent-students.component.scss']
})
export class RecentStudentsComponent implements OnInit {
  @Input() establishmentId!: string;
  @Input() isSuperAdmin: boolean = false;

  topStudents: TopUserPresenceResponse[] = [];
  topEstablishments: TopEstablishmentByUsersResponse[] = [];
  loading: boolean = true;

  constructor(private organizationService: OrganizationService) { }

  ngOnInit(): void {
    if (this.isSuperAdmin) {
      this.loadTopEstablishments();
    } else if (this.establishmentId) {
      this.loadTopStudents();
    } else {
      this.loading = false;
    }
  }

  loadTopStudents(): void {
    this.loading = true;
    this.organizationService.getTopPresentUsers(this.establishmentId)
        .subscribe({
          next: (students) => {
            this.topStudents = students.slice(0, 5);
            this.loading = false;
          },
          error: (err) => {
            console.error('Failed to load top students:', err);
            this.loading = false;
          }
        });
  }

  loadTopEstablishments(): void {
    this.loading = true;
    this.organizationService.getTop10EstablishmentsByTotalUsers()
        .subscribe({
          next: (establishments) => {
            this.topEstablishments = establishments.slice(0, 5);
            this.loading = false;
          },
          error: (err) => {
            console.error('Failed to load top establishments:', err);
            this.loading = false;
          }
        });
  }

  getPositionColor(index: number): string {
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#5e4dcd', '#5e4dcd'];
    return colors[index] || '#5e4dcd';
  }
}


// import { Component, Input, OnInit } from '@angular/core';
// import { CommonModule } from "@angular/common";
// import {TopUserPresenceResponse} from "../../../organizations/organization";
// import {OrganizationService} from "../../../organizations/organization.service";
//
// @Component({
//   selector: 'app-recent-students',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './recent-students.component.html',
//   styleUrls: ['./recent-students.component.scss']
// })
//
// export class RecentStudentsComponent implements OnInit {
//   @Input() establishmentId!: string;
//   topStudents: TopUserPresenceResponse[] = [];
//
//   constructor(private organizationService: OrganizationService) { }
//
//   ngOnInit(): void {
//     if (this.establishmentId) {
//       this.loadTopStudents();
//     }
//   }
//
//   loadTopStudents(): void {
//     this.organizationService.getTopPresentUsers(this.establishmentId)
//         .subscribe({
//           next: (students) => {
//             this.topStudents = students.slice(0, 5); // Prendre les 5 premiers
//           },
//           error: (err) => {
//             console.error('Failed to load top students:', err);
//           }
//         });
//   }
//
//   getPositionColor(index: number): string {
//     const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#5e4dcd', '#5e4dcd'];
//     return colors[index] || '#5e4dcd';
//   }
// }
//
