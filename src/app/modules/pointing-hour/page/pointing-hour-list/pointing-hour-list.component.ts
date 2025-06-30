import {Component, Input} from '@angular/core';
import {PointingHourResponse} from "../../pointing-hour";
import {PointingHourFormComponent} from "../pointing-hour-form/pointing-hour-form.component";
import {PointingHourService} from "../../pointing-hour.service";
import {MatDialog} from "@angular/material/dialog";
import {CalendarEvent, CalendarModule, CalendarView} from 'angular-calendar';
import {Subject} from "rxjs";
import { startOfDay, endOfDay, isSameMonth } from 'date-fns';
import {isSameDay} from "date-fns";
import {FormsModule} from "@angular/forms";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-pointing-hour-list',
  standalone: true,
  imports: [
    FormsModule,
    CalendarModule,
    DatePipe
  ],
  templateUrl: 'pointing-hour-list.component.html',
  styleUrls: ['pointing-hour-list.component.scss'],
})
export class PointingHourListComponent {
  @Input() classId!: string;
  pointingHours: PointingHourResponse[] = [];
  filteredHours: PointingHourResponse[] = [];
  selectedDateHours: PointingHourResponse[] = [];
  selectedDate: Date = new Date();

  // Calendar configuration
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  refresh = new Subject<void>();

  // Filter
  dateRange = {
    start: new Date(),
    end: new Date(new Date().setMonth(new Date().getMonth() + 1))
  };

  constructor(
      private pointingHourService: PointingHourService,
      private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPointingHours();
  }

  loadPointingHours(): void {
    this.pointingHourService.getPointingHoursByClassService(this.classId).subscribe({
      next: (hours) => {
        this.pointingHours = hours;
        this.filteredHours = [...hours];
        this.updateCalendarEvents();
        this.updateSelectedDateHours();
      },
      error: (err) => console.error('Failed to load pointing hours:', err)
    });
  }

  updateCalendarEvents(): void {
    this.events = this.filteredHours.map(hour => ({
      start: new Date(hour.startTime),
      end: new Date(hour.endTime),
      title: `${hour.startTime} - ${hour.endTime}`,
      color: {
        primary: '#1e90ff',
        secondary: '#D1E8FF'
      },
      meta: hour
    }));
  }

  updateSelectedDateHours(): void {
    this.selectedDateHours = this.filteredHours.filter(hour =>
        isSameDay(new Date(hour.startTime), this.selectedDate)
    );
  }

  onDateSelect(date: Date): void {
    this.selectedDate = date;
    this.updateSelectedDateHours();
  }

  applyFilter(): void {
    if (this.dateRange.start && this.dateRange.end) {
      const start = this.dateRange.start.toISOString();
      const end = this.dateRange.end.toISOString();

      this.pointingHourService.getPointingHoursBetween(start, end).subscribe({
        next: (hours) => {
          this.filteredHours = hours;
          this.updateCalendarEvents();
          this.updateSelectedDateHours();
        },
        error: (err) => console.error('Failed to filter pointing hours:', err)
      });
    }
  }

  resetFilter(): void {
    this.dateRange = {
      start: new Date(),
      end: new Date(new Date().setMonth(new Date().getMonth() + 1))
    };
    this.filteredHours = [...this.pointingHours];
    this.updateCalendarEvents();
    this.updateSelectedDateHours();
  }

  openAddPointingHour(): void {
    const dialogRef = this.dialog.open(PointingHourFormComponent, {
      width: '500px',
      data: { classId: this.classId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPointingHours();
      }
    });
  }

  openEditPointingHour(hour: PointingHourResponse): void {
    const dialogRef = this.dialog.open(PointingHourFormComponent, {
      width: '500px',
      data: { hour, classId: this.classId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPointingHours();
      }
    });
  }

  deletePointingHour(hourId: string): void {
    if (confirm('Are you sure you want to delete this pointing hour?')) {
      // this.pointingHourService.deletePointingHour(hourId).subscribe({
      //   next: () => {
      //     this.loadPointingHours();
      //   },
      //   error: (err) => console.error('Failed to delete pointing hour:', err)
      // });
    }
  }
}
