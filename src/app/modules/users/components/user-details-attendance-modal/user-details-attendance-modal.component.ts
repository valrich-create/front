import {AttendanceRecord} from "../../users.models";
import {Component, Input} from "@angular/core";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-user-details-attendance-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Détails de présence</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <div class="row mb-3">
        <div class="col-md-6">
          <select class="form-select" [(ngModel)]="selectedMonth">
            <option *ngFor="let month of months; let i = index" [value]="i+1">{{month}}</option>
          </select>
        </div>
        <div class="col-md-6">
          <select class="form-select" [(ngModel)]="selectedYear">
            <option *ngFor="let year of years" [value]="year">{{year}}</option>
          </select>
        </div>
      </div>

      <div class="calendar-container">
        <div class="calendar-header">
          <span *ngFor="let day of ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']">{{day}}</span>
        </div>
        <div class="calendar-grid">
          <div *ngFor="let day of visibleDays" 
               class="calendar-day"
               [class.present]="day.status === 'present'"
               [class.absent]="day.status === 'absent'"
               [class.partial]="day.status === 'partial'"
               [class.selected]="day.date === selectedDay?.date"
               (click)="selectDay(day)">
            {{day.date.getDate()}}
          </div>
        </div>
      </div>

      <div class="day-details mt-4" *ngIf="selectedDay">
        <h6>Détails pour le {{selectedDay.date | date:'fullDate'}}</h6>
        
        <div *ngIf="selectedDay.hours && selectedDay.hours.length > 0; else noData">
          <div class="hour-slot" *ngFor="let hour of selectedDay.hours">
            <span>{{hour.start}} - {{hour.end}}</span>
            <span class="status-badge" [class.present]="hour.status === 'present'"
                  [class.absent]="hour.status === 'absent'"
                  [class.partial]="hour.status === 'partial'">
              {{hour.status === 'present' ? 'Présent' : (hour.status === 'absent' ? 'Absent' : 'Partiel')}}
            </span>
          </div>
        </div>
        <ng-template #noData>
          <div class="text-muted">Aucune donnée de présence pour ce jour</div>
        </ng-template>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.close()">Fermer</button>
    </div>
  `,
  styles: [`
    .calendar-container {
      display: flex;
      flex-direction: column;
    }

    .calendar-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }

    .calendar-day {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      cursor: pointer;
    }

    .calendar-day:hover {
      opacity: 0.8;
    }

    .calendar-day.present {
      background-color: #a3ffab;
    }

    .calendar-day.absent {
      background-color: #ffabab;
    }

    .calendar-day.partial {
      background-color: #fff6a5;
    }

    .calendar-day.selected {
      border: 2px solid #4e3aa7;
    }

    .day-details {
      background-color: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
    }

    .hour-slot {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .hour-slot:last-child {
      border-bottom: none;
    }

    .status-badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    .status-badge.present {
      background-color: #a3ffab;
    }

    .status-badge.absent {
      background-color: #ffabab;
    }

    .status-badge.partial {
      background-color: #fff6a5;
    }
  `]
})
export class UserDetailsAttendanceModalComponent {
  constructor(public activeModal: NgbActiveModal) {}

  @Input() attendanceRecords: AttendanceRecord[] = [];

  months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  years = [2023, 2024, 2025];
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

  visibleDays: any[] = [];
  selectedDay: AttendanceRecord | null = null;

  ngOnInit() {
    this.generateCalendarDays();
  }

  selectDay(day: any) {
    this.selectedDay = day;
  }

  private generateCalendarDays() {
    // Implémentation pour générer les jours du mois avec les données de présence
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    const firstDay = new Date(this.selectedYear, this.selectedMonth - 1, 1).getDay();

    this.visibleDays = [];

    // Ajouter les jours vides pour le début du mois
    for (let i = 1; i < firstDay; i++) {
      this.visibleDays.push({});
    }

    // Ajouter les jours du mois
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(this.selectedYear, this.selectedMonth - 1, i);
      const record = this.attendanceRecords.find(r =>
          r.date.getDate() === currentDate.getDate() &&
          r.date.getMonth() === currentDate.getMonth() &&
          r.date.getFullYear() === currentDate.getFullYear()
      );

      this.visibleDays.push({
        date: currentDate,
        status: record?.status,
        hours: record?.hours
      });
    }

    // Sélectionner le premier jour avec des données par défaut
    const firstDayWithData = this.visibleDays.find(d => d.status);
    if (firstDayWithData) {
      this.selectedDay = firstDayWithData;
    }
  }
}

// import {Component, EventEmitter, Input, Output} from '@angular/core';
// import {CommonModule} from "@angular/common";
// import {FormsModule} from "@angular/forms";
//
// @Component({
//   selector: 'app-user-details-attendance-modal',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   template: `
//     <div class="modal-header">
//       <h5 class="modal-title">Detailed Attendance History</h5>
//       <button type="button" class="btn-close" (click)="close.emit()"></button>
//     </div>
//     <div class="modal-body">
//       <div class="row mb-3">
//         <div class="col-md-6">
//           <select class="form-select" [(ngModel)]="selectedMonth">
//             <option *ngFor="let month of months; let i = index" [value]="i+1">{{month}}</option>
//           </select>
//         </div>
//         <div class="col-md-6">
//           <select class="form-select" [(ngModel)]="selectedYear">
//             <option *ngFor="let year of years" [value]="year">{{year}}</option>
//           </select>
//         </div>
//       </div>
//
//       <div class="row">
//         <div class="col-md-7">
//           <div class="modal-calendar mb-3">
//             <div class="fw-bold text-center">M</div>
//             <div class="fw-bold text-center">T</div>
//             <div class="fw-bold text-center">W</div>
//             <div class="fw-bold text-center">T</div>
//             <div class="fw-bold text-center">F</div>
//             <div class="fw-bold text-center">S</div>
//             <div class="fw-bold text-center">S</div>
//
//             <ng-container *ngFor="let day of calendarDays">
//               <div class="modal-day"
//                    [class.present]="day.status === 'present'"
//                    [class.absent]="day.status === 'absent'"
//                    [class.partial]="day.status === 'partial'"
//                    [class.neutral]="!day.status"
//                    [class.active]="day.day === selectedDay?.day"
//                    (click)="selectDay(day)">
//                 {{day.day}}
//               </div>
//             </ng-container>
//           </div>
//
//           <div class="d-flex mb-3">
//             <div class="me-3">
//               <span class="status-indicator present"></span> Present
//             </div>
//             <div class="me-3">
//               <span class="status-indicator absent"></span> Absent
//             </div>
//             <div>
//               <span class="status-indicator partial"></span> Partial
//             </div>
//           </div>
//         </div>
//
//         <div class="col-md-5" *ngIf="selectedDay">
//           <div class="day-details">
//             <h6 class="mb-3">Details for {{selectedDay.day}} {{months[selectedMonth-1]}} {{selectedYear}}</h6>
//
//             <div class="hour-slot" *ngFor="let hour of selectedDay.hours || []">
//               <span>{{hour.start}} - {{hour.end}}</span>
//               <span class="status-indicator" [class.present]="hour.status === 'present'"
//                     [class.absent]="hour.status === 'absent'"
//                     [class.partial]="hour.status === 'partial'"></span>
//             </div>
//
//             <div *ngIf="!selectedDay.hours || selectedDay.hours.length === 0" class="text-muted">
//               No attendance data for this day
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//     <div class="modal-footer">
//       <button type="button" class="btn btn-secondary" (click)="close.emit()">Close</button>
//     </div>
//   `,
//   styles: ``
// })
// export class UserDetailsAttendanceModalComponent {
//   @Input() isOpen = false;
//   @Output() close = new EventEmitter<void>();
//
//   months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//   years = [2023, 2024, 2025];
//   selectedMonth = new Date().getMonth() + 1;
//   selectedYear = new Date().getFullYear();
//   calendarDays: any[] = [];
//   selectedDay: any = null;
//
//   ngOnChanges() {
//     if (this.isOpen) {
//       this.generateCalendarDays();
//     }
//   }
//
//   selectDay(day: any) {
//     if (day.day) {
//       this.selectedDay = day;
//     }
//   }
//
//   private generateCalendarDays() {
//     // This is a simplified version - in a real app, you'd use the user's attendance records
//     const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
//     const firstDayOfMonth = new Date(this.selectedYear, this.selectedMonth - 1, 1).getDay();
//
//     // Adjust for Monday start (0 = Monday)
//     let offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
//
//     this.calendarDays = [];
//
//     // Add empty days for offset
//     for (let i = 0; i < offset; i++) {
//       this.calendarDays.push({});
//     }
//
//     // Add actual days
//     for (let i = 1; i <= daysInMonth; i++) {
//       // Random status for demo purposes
//       const status = Math.random() > 0.3 ? 'present' : (Math.random() > 0.5 ? 'absent' : 'partial');
//       this.calendarDays.push({
//         day: i,
//         status: i % 5 === 0 ? 'absent' : (i % 7 === 0 ? 'partial' : 'present')
//       });
//     }
//   }
// }
