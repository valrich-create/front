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
