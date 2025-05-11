// calendar.component.ts
import { Component, OnInit, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {EventService} from "../events.service";
import {Events} from "../events";
import {Router} from "@angular/router";

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

export class CalendarComponent implements OnInit {
  // Input pour permettre la customisation du calendrier si nécessaire
  selectedDate = input<Date>(new Date());

  // Output pour la communication avec le composant parent
  daySelected = output<Date>();

  // Signals pour la réactivité
  currentMonth = signal<Date>(new Date());
  days = signal<Array<Day>>([]);

  weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  years = computed(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({length: 10}, (_, i) => currentYear - 5 + i);
  });

  displayMonth = computed(() => {
    return this.months[this.currentMonth().getMonth()];
  });

  displayYear = computed(() => {
    return this.currentMonth().getFullYear();
  });

  constructor(
      private eventService: EventService,
      private router: Router
  ) {}

  ngOnInit(): void {
    // Initialiser le calendrier avec le mois actuel
    this.refreshCalendar();
  }

  createNewEvent() {
    this.router.navigate(['/events/new']);
  }

  refreshCalendar(): void {
    const year = this.currentMonth().getFullYear();
    const month = this.currentMonth().getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Ajuster pour que le premier jour soit lundi (1) et non dimanche (0)
    const firstWeekday = firstDayOfMonth.getDay() || 7;

    const daysInMonth = lastDayOfMonth.getDate();

    // Générer les jours du mois précédent pour compléter la première semaine
    const previousMonthDays = firstWeekday - 1;
    const previousMonth = new Date(year, month, 0);
    const previousMonthLastDay = previousMonth.getDate();

    let calendarDays: Day[] = [];

    // Jours du mois précédent
    for (let i = previousMonthDays - 1; i >= 0; i--) {
      const dayOfMonth = previousMonthLastDay - i;
      const date = new Date(year, month - 1, dayOfMonth);
      calendarDays.push({
        date,
        dayOfMonth,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        events: this.getEventsForDay(date)
      });
    }

    // Jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      calendarDays.push({
        date,
        dayOfMonth: i,
        isCurrentMonth: true,
        isToday: this.isToday(date),
        events: this.getEventsForDay(date)
      });
    }

    // Jours du mois suivant pour compléter la dernière semaine
    const nextMonthDays = 42 - calendarDays.length; // 42 = 6 semaines x 7 jours
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i);
      calendarDays.push({
        date,
        dayOfMonth: i,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        events: this.getEventsForDay(date)
      });
    }

    this.days.set(calendarDays);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
  }

  getEventsForDay(date: Date): Events[] {
    return this.eventService.getEventsForDay(date);
  }

  hasEvents(day: Day): boolean {
    return day.events.length > 0;
  }

  getEventColors(day: Day): string[] {
    // Retourne les couleurs uniques des événements
    return Array.from(new Set(day.events.map(e => e.color)));
  }

  onMonthChange(month: string): void {
    const monthIndex = this.months.indexOf(month);
    const current = new Date(this.currentMonth());
    current.setMonth(monthIndex);
    this.currentMonth.set(current);
    this.refreshCalendar();
  }

  onYearChange(year: number): void {
    const current = new Date(this.currentMonth());
    current.setFullYear(year);
    this.currentMonth.set(current);
    this.refreshCalendar();
  }

  previousMonth(): void {
    const current = new Date(this.currentMonth());
    current.setMonth(current.getMonth() - 1);
    this.currentMonth.set(current);
    this.refreshCalendar();
  }

  nextMonth(): void {
    const current = new Date(this.currentMonth());
    current.setMonth(current.getMonth() + 1);
    this.currentMonth.set(current);
    this.refreshCalendar();
  }

  selectDay(day: Day): void {
    this.daySelected.emit(day.date);
  }
}

// Modèle pour un jour dans le calendrier
interface Day {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Events[];
}