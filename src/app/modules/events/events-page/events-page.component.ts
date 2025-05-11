// events-event-form.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CalendarComponent} from "../calendar/calendar.component";
import {EventsListComponent} from "../event-list/events-list.component";
import {LayoutComponent} from "../../base-component/components/layout/layout.component";
import {NavbarComponent} from "../../base-component/components/navbar/navbar.component";

@Component({
  selector: 'app-events-event-form',
  standalone: true,
  imports: [CommonModule, CalendarComponent, EventsListComponent, LayoutComponent, NavbarComponent],
  templateUrl: './events-page.component.html',
  styleUrls: ['./events-page.component.scss']
})
export class EventsPageComponent {
  selectedDate = signal<Date>(new Date());

  onDaySelected(date: Date): void {
    this.selectedDate.set(date);
  }
}