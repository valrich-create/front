import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDialog } from '@angular/material/dialog';
import { PointingZoneFormComponent } from '../pointing-zone-form/pointing-zone-form.component';
import {ZonePointageResponse} from "../../../base-component/pointage";
import {PointingZoneService} from "../../pointing-zone.service";
import {ConfirmDialogComponent} from "../../../base-component/components/confirm-dialog/confirm-dialog.component";

declare var L: any;

@Component({
  selector: 'app-pointing-zone-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './pointing-zone-list.component.html',
  styleUrls: ['./pointing-zone-list.component.scss']
})
export class PointingZoneListComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  zones: ZonePointageResponse[] = [];
  selectedZone: ZonePointageResponse | null = null;
  private map: any;
  private markers: any[] = [];
  private defaultCenter = [51.505, -0.09];
  private defaultZoom = 13;

  constructor(
      private zoneService: PointingZoneService,
      private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadZones();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement).setView(this.defaultCenter, this.defaultZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  loadZones(): void {
    this.zoneService.getAllZones().subscribe({
      next: (zones) => {
        this.zones = zones;
        this.updateMapMarkers();
      },
      error: (err) => console.error('Failed to load zones', err)
    });
  }

  updateMapMarkers(): void {
    // Clear existing markers
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    // Add new markers
    this.zones.forEach(zone => {
      const marker = L.circleMarker([zone.latitude, zone.longitude], {
        radius: 8,
        color: zone.id === this.selectedZone?.id ? '#5E50C5' : '#e74c3c',
        fillColor: zone.id === this.selectedZone?.id ? '#E7E6FB' : '#fadbd8',
        fillOpacity: 0.8,
        weight: 2
      }).addTo(this.map);

      marker.on('click', () => this.selectZone(zone));

      // Add zone info to marker
      marker.bindPopup(`
        <b>${zone.nom}</b><br>
        Radius: ${zone.rayonMetres}m<br>
        ${zone.description || ''}
      `);

      this.markers.push(marker);
    });

    // Fit map to show all markers if there are any
    if (this.zones.length > 0) {
      const group = new L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.2));
    }
  }

  selectZone(zone: ZonePointageResponse): void {
    this.selectedZone = zone;
    this.updateMapMarkers();
    this.map.setView([zone.latitude, zone.longitude], 15);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(PointingZoneFormComponent, {
      width: '800px',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadZones();
      }
    });
  }

  deleteZone(zone: ZonePointageResponse, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Zone',
        message: `Are you sure you want to delete "${zone.nom}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.zoneService.deleteZone(zone.id).subscribe({
          next: () => {
            this.zones = this.zones.filter(z => z.id !== zone.id);
            if (this.selectedZone?.id === zone.id) {
              this.selectedZone = null;
            }
            this.updateMapMarkers();
          },
          error: (err) =>{
            console.error('Failed to delete zone', err);
            alert('Failed to delete zone')
          }
        });
      }
    });
  }
}