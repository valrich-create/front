import {Component, Input, OnInit} from '@angular/core';
import {PointingHourResponse} from "../../pointing-hour";
import {PointingHourFormComponent} from "../pointing-hour-form/pointing-hour-form.component";
import {PointingHourService} from "../../pointing-hour.service";
import {MatDialog} from "@angular/material/dialog";
import {isSameDay} from "date-fns";
import {FormsModule} from "@angular/forms";
import {CommonModule, DatePipe} from "@angular/common";
import {LayoutComponent} from "../../../base-component/components/layout/layout.component";
import {NavbarComponent} from "../../../base-component/components/navbar/navbar.component";
import {MatNativeDateModule} from "@angular/material/core";
import {catchError, of} from "rxjs";
import {CalendarComponent} from "../../../events/calendar/calendar.component";
import { format } from 'date-fns';

@Component({
  selector: 'app-pointing-hour-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatNativeDateModule,
    DatePipe,
    LayoutComponent,
    NavbarComponent,
    CalendarComponent
  ],
  templateUrl: 'pointing-hour-list.component.html',
  styleUrls: ['pointing-hour-list.component.scss'],
})

export class PointingHourListComponent implements OnInit {
  eventDates: Date[] = [];
  selectedDate = new Date();
  currentMonth = new Date();
  pageTitlePrincipal: string = "Horaire";
  pageTitle = "Classe / Services & Users";
  pointingHours: PointingHourResponse[] = [];

  constructor(
      private pointingHourService: PointingHourService,
      private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const start = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const end = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);

    const startDateStr = format(start, 'yyyy-MM-dd');
    const endDateStr = format(end, 'yyyy-MM-dd');

    this.pointingHourService.getPointingHourByEstablishmentBetweenForConnectedUser(startDateStr, endDateStr)
        .pipe(catchError(() => of([])))
        .subscribe(hours => {
          this.pointingHours = hours;
          this.updateEventDates();
          this.loadHoursForDay(this.selectedDate);
        });
  }

  openAdd(): void {
    const ref = this.dialog.open(PointingHourFormComponent, { width: '500px' });
    ref.afterClosed().subscribe(() => this.loadData());
  }

  updateEventDates(): void {
    this.eventDates = [...new Set(
        this.pointingHours.map(h => new Date(h.startTime).toDateString())
    )].map(dateStr => new Date(dateStr));
  }

  loadHoursForDay(date: Date): void {
    this.selectedDate = date;
    // Filtrage local pour l'exemple (peut être remplacé par un appel API)
    this.pointingHours = this.pointingHours.filter(h =>
        isSameDay(new Date(h.startTime), date)
    );

    const dateStr = format(date, 'yyyy-MM-dd');

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    this.pointingHourService.getPointingHourByEstablishmentBetweenForConnectedUser(dateStr, dateStr)
        .pipe(catchError(() => of([])))
        .subscribe(hours => {
          this.pointingHours = hours;
        });
  }

  onDateSelected(date: Date): void {
    this.loadHoursForDay(date);
  }

  onMonthChanged(month: Date): void {
    this.currentMonth = month;
    this.loadData();
  }
}
