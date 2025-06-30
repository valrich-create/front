import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {faDatabase, faEllipsisV} from '@fortawesome/free-solid-svg-icons';
import {PaginationComponent} from "../pagination/pagination.component";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-class-users-list',
  standalone: true,
  imports: [FontAwesomeModule, PaginationComponent, CommonModule],
  templateUrl: './class-users-list.component.html',
  styleUrls: ['./class-users-list.component.scss']
})
export class ClassUsersListComponent {
  @Input() className: string = '';
  @Input() users: any[] = [];
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;

  @Output() pageChange = new EventEmitter<number>();

  faEllipsisV = faEllipsisV;
  faDatabase = faDatabase;

  onPageChange(newPage: number): void {
    this.pageChange.emit(newPage);
  }

  protected readonly Math = Math;
}
