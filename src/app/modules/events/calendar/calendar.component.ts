// calendar.component.ts
import {
  Component,
  OnInit,
  signal,
  computed,
  input,
  output,
  Input,
  Output,
  EventEmitter,
  OnChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {EventService} from "../events.service";
import {Information} from "../information";
import {Router} from "@angular/router";

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

export class CalendarComponent implements OnInit , OnChanges{
  @Input() eventDates: Date[] = [];
  @Input() selectedDate?: Date;
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() monthChanged = new EventEmitter<Date>();

  currentMonth = new Date();
  days: Day[] = [];
  weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  ngOnInit(): void {
    this.generateCalendar();
  }

  ngOnChanges(): void {
    this.generateCalendar();
  }

  generateCalendar(): void {
    this.days = [];
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Jours du mois précédent
    const startDay = firstDay.getDay() || 7;
    for (let i = startDay - 1; i > 0; i--) {
      this.addDay(new Date(year, month, -i + 1), false);
    }

    // Jours du mois courant
    for (let i = 1; i <= lastDay.getDate(); i++) {
      this.addDay(new Date(year, month, i), true);
    }

    // Jours du mois suivant
    const daysNeeded = 42 - this.days.length; // 6 semaines
    for (let i = 1; i <= daysNeeded; i++) {
      this.addDay(new Date(year, month + 1, i), false);
    }
  }

  private addDay(date: Date, isCurrentMonth: boolean): void {
    const isEventDay = this.eventDates.some(d =>
        d.toDateString() === date.toDateString()
    );
    const isSelected = this.selectedDate?.toDateString() === date.toDateString();

    this.days.push({
      date,
      dayOfMonth: date.getDate(),
      isCurrentMonth,
      isToday: this.isToday(date),
      isSelected,
      hasEvents: isEventDay
    });
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  selectDay(day: Day): void {
    this.dateSelected.emit(day.date);
  }

  changeMonth(months: number): void {
    this.currentMonth = new Date(
        this.currentMonth.getFullYear(),
        this.currentMonth.getMonth() + months,
        1
    );
    this.generateCalendar();
    this.monthChanged.emit(this.currentMonth);
  }
}

interface Day {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasEvents: boolean;
}
