import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PaginationComponent} from "../pagination/pagination.component";
import {CommonModule} from "@angular/common";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {faChartLine} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-class-presence-classement',
  standalone: true,
  imports: [
      PaginationComponent,
      CommonModule,
      FontAwesomeModule,
  ],
  templateUrl: './class-presence-classement.component.html',
  styleUrls: ['./class-presence-classement.component.scss']
})
export class ClassPresenceClassementComponent {
  @Input() topPresenceUsers: any[] = [];
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 100;
  @Input() itemsPerPage: number = 5;
  @Output() pageChange = new EventEmitter<number>();

  faChartLine = faChartLine;

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

  onPageChange(newPage: number): void {
    this.pageChange.emit(newPage);
  }
}
