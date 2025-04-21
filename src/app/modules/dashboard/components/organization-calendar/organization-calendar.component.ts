import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday?: boolean;
  hasEvent?: boolean;
  isHighlighted?: boolean;
}

@Component({
  selector: 'app-organization-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './organization-calendar.component.html',
  styleUrls: ['./organization-calendar.component.scss']
})
export class OrganizationCalendarComponent implements OnInit {
  currentMonth = 'March 2021';
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: CalendarDay[] = [];

  constructor() { }

  ngOnInit(): void {
    this.generateCalendarDays();
  }

  generateCalendarDays() {
    // This is a simplified version just for the UI
    // In a real app, you'd calculate this based on the actual date

    // Previous month days
    this.calendarDays.push({ date: 31, isCurrentMonth: false });

    // Current month days
    for (let i = 1; i <= 31; i++) {
      let day: CalendarDay = {
        date: i,
        isCurrentMonth: true
      };

      // Add some events and highlights for demo
      if (i === 8 || i === 23) {
        day.hasEvent = true;
      }

      if (i === 20) {
        day.isHighlighted = true;
      }

      this.calendarDays.push(day);
    }

    // Next month days
    this.calendarDays.push({ date: 1, isCurrentMonth: false });
    this.calendarDays.push({ date: 2, isCurrentMonth: false });
    this.calendarDays.push({ date: 3, isCurrentMonth: false });
  }
}
