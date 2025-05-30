import { Component, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";

interface CalendarDay {
	date: number;
	isCurrentMonth: boolean;
	isToday: boolean;
	isWeekend: boolean;
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
	currentDate: Date = new Date();
	currentMonth: string = '';
	weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	calendarDays: CalendarDay[] = [];

	constructor() { }

	ngOnInit(): void {
		this.generateMonthName();
		this.generateCalendarDays();
	}

	private generateMonthName(): void {
		const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
		this.currentMonth = this.currentDate.toLocaleDateString('en-US', options);
	}

	private generateCalendarDays(): void {
		const year = this.currentDate.getFullYear();
		const month = this.currentDate.getMonth();

		// Get first and last day of the month
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);

		// Get days from previous month to show
		const prevMonthLastDay = new Date(year, month, 0).getDate();
		const firstDayOfWeek = firstDay.getDay(); // 0 (Sunday) to 6 (Saturday)

		// Get days from next month to show
		const lastDayOfWeek = lastDay.getDay();
		const daysFromNextMonth = 6 - lastDayOfWeek;

		// Clear any existing days
		this.calendarDays = [];

		// Add days from previous month
		for (let i = firstDayOfWeek - 1; i >= 0; i--) {
			this.calendarDays.push({
				date: prevMonthLastDay - i,
				isCurrentMonth: false,
				isToday: false,
				isWeekend: false
			});
		}

		// Add days from current month
		const today = new Date();
		const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

		for (let i = 1; i <= lastDay.getDate(); i++) {
			const dayOfWeek = new Date(year, month, i).getDay();
			this.calendarDays.push({
				date: i,
				isCurrentMonth: true,
				isToday: isCurrentMonth && i === today.getDate(),
				isWeekend: dayOfWeek === 0 || dayOfWeek === 6
			});
		}

		// Add days from next month
		for (let i = 1; i <= daysFromNextMonth; i++) {
			this.calendarDays.push({
				date: i,
				isCurrentMonth: false,
				isToday: false,
				isWeekend: false
			});
		}
	}
}








// import {Component, OnInit} from '@angular/core';
// import {CommonModule} from "@angular/common";
//
// interface CalendarDay {
//   date: number;
//   isCurrentMonth: boolean;
//   isToday?: boolean;
//   hasEvent?: boolean;
//   isHighlighted?: boolean;
// }
//
// @Component({
//   selector: 'app-organization-calendar',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './organization-calendar.component.html',
//   styleUrls: ['./organization-calendar.component.scss']
// })
// export class OrganizationCalendarComponent implements OnInit {
//   currentMonth = 'March 2021';
//   weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//   calendarDays: CalendarDay[] = [];
//
//   constructor() { }
//
//   ngOnInit(): void {
//     this.generateCalendarDays();
//   }
//
//   generateCalendarDays() {
//     // This is a simplified version just for the UI
//     // In a real app, you'd calculate this based on the actual date
//
//     // Previous month days
//     this.calendarDays.push({ date: 31, isCurrentMonth: false });
//
//     // Current month days
//     for (let i = 1; i <= 31; i++) {
//       let day: CalendarDay = {
//         date: i,
//         isCurrentMonth: true
//       };
//
//       // Add some events and highlights for demo
//       if (i === 8 || i === 23) {
//         day.hasEvent = true;
//       }
//
//       if (i === 20) {
//         day.isHighlighted = true;
//       }
//
//       this.calendarDays.push(day);
//     }
//
//     // Next month days
//     this.calendarDays.push({ date: 1, isCurrentMonth: false });
//     this.calendarDays.push({ date: 2, isCurrentMonth: false });
//     this.calendarDays.push({ date: 3, isCurrentMonth: false });
//   }
// }
