// event-list.component.ts
import {Component, input, effect, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import {EventService} from "../events.service";
import {Information} from "../information";
import {NavbarComponent} from "../../base-component/components/navbar/navbar.component";
import {LayoutComponent} from "../../base-component/components/layout/layout.component";

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss']
})
export class EventsListComponent {
  selectedDate = input<Date>();
  events = signal<Information[]>([]);

  constructor(private eventService: EventService) {
    effect(() => {
      if (this.selectedDate()) {
        this.loadEvents();
      }
    });
  }

  loadEvents(): void {
    const date = this.selectedDate();
    if (date) {
      this.events.set(this.eventService.getEventsForDay(date));
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}