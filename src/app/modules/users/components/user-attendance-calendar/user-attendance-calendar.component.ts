import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AttendanceRecord} from "../../users.models";

@Component({
  selector: 'app-user-attendance-calendar',
  standalone: true,
  template: `
    <div class="profile-card mb-4">
      <div class="profile-content">
        <div class="section-header">
          <h3 class="section-title">Attendance History</h3>
          <a class="see-more" (click)="openModal.emit()">See more</a>
        </div>

        <div class="attendance-calendar">
          <div class="text-center fw-bold">M</div>
          <div class="text-center fw-bold">T</div>
          <div class="text-center fw-bold">W</div>
          <div class="text-center fw-bold">T</div>
          <div class="text-center fw-bold">F</div>
          <div class="text-center fw-bold">S</div>
          <div class="text-center fw-bold">S</div>

          <ng-container *ngFor="let day of calendarDays">
            <div class="calendar-day"
                 [class.present]="day.status === 'present'"
                 [class.absent]="day.status === 'absent'"
                 [class.partial]="day.status === 'partial'"
                 [class.neutral]="!day.status">
              {{day.day}}
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class UserAttendanceCalendarComponent {
  @Input() attendanceRecords: AttendanceRecord[] = [];
  @Output() openModal = new EventEmitter<void>();

  calendarDays: any[] = [];

  ngOnChanges() {
    this.generateCalendarDays();
  }

  private generateCalendarDays() {
    // Implementation from previous version
  }
}
