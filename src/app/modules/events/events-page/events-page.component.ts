// events-page.component.ts
import {Component, HostListener, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {LayoutComponent} from "../../base-component/components/layout/layout.component";
import {NavbarComponent} from "../../base-component/components/navbar/navbar.component";
import {InformationResponse} from "../information";
import {EventService} from "../events.service";
import {MatDialog} from "@angular/material/dialog";
import {EventFormComponent} from "../event-form/event-form.component";
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";
import {MatListModule} from "@angular/material/list";
import {MatButtonModule} from "@angular/material/button";
import {MatChipsModule} from "@angular/material/chips";
import {MatTooltipModule} from "@angular/material/tooltip";

@Component({
  selector: 'app-events-page',
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent,
    NavbarComponent,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './events-page.component.html',
  styleUrls: ['./events-page.component.scss']
})
export class EventsPageComponent implements OnInit {
  selectedDate = signal<Date>(new Date());
  informations = signal<InformationResponse[]>([]);
  selectedInformation = signal<InformationResponse | null>(null);
  isMobile = signal(window.innerWidth < 768);

  constructor(
      private eventService: EventService,
      private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadInformations();
  }

  loadInformations(): void {
    this.eventService.getCurrentUserInformations().subscribe({
      next: (response) => {
        this.informations.set(response.content || []);
      },
      error: (err) => console.error('Failed to load informations', err)
    });
  }

  onDaySelected(date: Date): void {
    this.selectedDate.set(date);
  }

  selectInformation(info: InformationResponse): void {
    this.selectedInformation.set(info);
  }

  openCreateModal(): void {
    const dialogRef = this.dialog.open(EventFormComponent, {
      width: '700px',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadInformations();
      }
    });
  }

  openEditModal(info: InformationResponse, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const dialogRef = this.dialog.open(EventFormComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: info
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadInformations();
      }
    });
  }

  deleteInformation(info: InformationResponse, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer "${info.title}" ?`)) {
      this.eventService.deleteInformation(info.id).subscribe({
        next: () => {
          this.loadInformations();
          if (this.selectedInformation()?.id === info.id) {
            this.selectedInformation.set(null);
          }
        },
        error: (err) => console.error('Failed to delete information', err)
      });
    }
  }

  truncateText(text: string, maxLength: number = 100): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateOnly(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  downloadFile(fileUrl: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  trackByInfoId(index: number, info: InformationResponse): string {
    return info.id.toString();
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth < 768);
  }
}