import {Component, computed, HostListener, OnInit, signal} from '@angular/core';
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

  selectedInfoFiles = computed(() => {
    const selected = this.selectedInformation();
    if (!selected) return [];

    // Filtrer les URLs valides (non vides et non nulles)
    const validFiles = selected.fileUrls?.filter(url =>
        url && url.trim() !== '' && this.isValidUrl(url)
    ) || [];

    console.log('Selected info files:', validFiles); // Debug
    return validFiles;
  });

  // Signal computed pour vérifier si on a des fichiers
  hasFiles = computed(() => this.selectedInfoFiles().length > 0);


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

  selectInformation(info: InformationResponse): void {
    console.log('File URLs:', info.fileUrls); // Debug
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

  // downloadFile(fileUrl: string, fileName: string): void {
  //   const link = document.createElement('a');
  //   link.href = fileUrl;
  //   link.download = fileName;
  //   link.target = '_blank';
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // }

  downloadFile(fileUrl: string, fileName: string): void {
    if (!fileUrl || !this.isValidUrl(fileUrl)) {
      console.error('URL de fichier invalide:', fileUrl);
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || 'fichier';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      // Fallback: ouvrir dans un nouvel onglet
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  }

  // Méthode de tracking pour les fichiers
  trackByFileUrl(index: number, fileUrl: string): string {
    return fileUrl;
  }

  trackByInfoId(index: number, info: InformationResponse): string {
    return info.id.toString();
  }

  // getFileNameFromUrl(url: string): string {
  //   if (!url) return '';
  //   return url.substring(url.lastIndexOf('/') + 1);
  // }

  getFileNameFromUrl(url: string): string {
    if (!url) return 'Fichier';

    try {
      // Extraire le nom du fichier de l'URL
      const urlObject = new URL(url);
      const pathname = urlObject.pathname;
      const fileName = pathname.substring(pathname.lastIndexOf('/') + 1);

      // Si pas de nom de fichier dans l'URL, utiliser un nom par défaut
      if (!fileName || fileName === '') {
        return 'Fichier';
      }

      // Décoder l'URL pour gérer les caractères spéciaux
      return decodeURIComponent(fileName);
    } catch (error) {
      console.error('Erreur lors de l\'extraction du nom de fichier:', error);
      return 'Fichier';
    }
  }


  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth < 768);
  }

  private isValidUrl(url: string): boolean {
    if (!url || url.trim() === '') return false;

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

}