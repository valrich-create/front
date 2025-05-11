import {Component, Input} from '@angular/core';
import {PaginationComponent} from "../pagination/pagination.component";
import {CommonModule} from "@angular/common";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-class-presence-classement',
  standalone: true,
  templateUrl: './class-presence-classement.component.html',
  imports: [
      PaginationComponent,
      CommonModule,
      FontAwesomeModule,
  ],
  styleUrls: ['./class-presence-classement.component.scss']
})
export class ClassPresenceClassementComponent {
  @Input() topPresenceUsers: any[] = [];
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 100;
  @Input() itemsPerPage: number = 5;

  getStatusClass(status: string): string {
    switch (status) {
      case 'Complete':
        return 'status-complete';
      case 'Pending':
        return 'status-pending';
      case 'Canceled':
        return 'status-canceled';
      default:
        return '';
    }
  }
}
