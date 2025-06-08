import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { ClassRankingResponse, TopEstablishmentByUsersResponse } from "../../../organizations/organization";
import { OrganizationService } from "../../../organizations/organization.service";

@Component({
  selector: 'app-recent-administration-activity',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-administration-activity.component.html',
  styleUrls: ['./recent-administration-activity.component.scss']
})
export class RecentAdministrationActivityComponent implements OnInit {
  @Input() establishmentId!: string;
  @Input() isSuperAdmin: boolean = false;

  classes: ClassRankingResponse[] = [];
  establishments: TopEstablishmentByUsersResponse[] = [];
  loading: boolean = true;

  constructor(private organizationService: OrganizationService) { }

  ngOnInit(): void {
    if (this.isSuperAdmin) {
      this.loadTopEstablishments();
    } else if (this.establishmentId) {
      this.loadClassesRanking();
    } else {
      this.loading = false;
    }
  }

  loadClassesRanking(): void {
    this.loading = true;
    this.organizationService.getClassesRanking(this.establishmentId)
        .subscribe({
          next: (classes) => {
            this.classes = classes;
            this.loading = false;
          },
          error: (err) => {
            console.error('Failed to load classes ranking:', err);
            this.loading = false;
          }
        });
  }

  loadTopEstablishments(): void {
    this.loading = true;
    this.organizationService.getTop10EstablishmentsByExistingUsers()
        .subscribe({
          next: (establishments) => {
            this.establishments = establishments;
            this.loading = false;
          },
          error: (err) => {
            console.error('Failed to load top establishments:', err);
            this.loading = false;
          }
        });
  }

  getPresenceRatePercentage(rate: number): string {
    return `${Math.round(rate * 100)}%`;
  }
}


// import { Component, Input, OnInit } from '@angular/core';
// import { CommonModule } from "@angular/common";
// import {ClassRankingResponse} from "../../../organizations/organization";
// import {OrganizationService} from "../../../organizations/organization.service";
//
// @Component({
//   selector: 'app-recent-administration-activity',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './recent-administration-activity.component.html',
//   styleUrls: ['./recent-administration-activity.component.scss']
// })
// export class RecentAdministrationActivityComponent implements OnInit {
//   @Input() establishmentId!: string;
//   classes: ClassRankingResponse[] = [];
//
//   constructor(private organizationService: OrganizationService) { }
//
//   ngOnInit(): void {
//     if (this.establishmentId) {
//       this.loadClassesRanking();
//     }
//   }
//
//   loadClassesRanking(): void {
//     this.organizationService.getClassesRanking(this.establishmentId)
//         .subscribe({
//           next: (classes) => {
//             this.classes = classes;
//           },
//           error: (err) => {
//             console.error('Failed to load classes ranking:', err);
//             // Vous pourriez ajouter ici un message d'erreur à l'utilisateur
//           }
//         });
//   }
//
//   getPresenceRatePercentage(rate: number): string {
//     return `${Math.round(rate * 100)}%`;
//   }
// }
