import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatDialog} from '@angular/material/dialog';
import {PointingZoneFormComponent} from '../pointing-zone-form/pointing-zone-form.component';
import {OwnerType, ZonePointageResponse} from "../../../base-component/pointage";
import {PointingZoneService} from "../../pointing-zone.service";
import {ConfirmDialogComponent} from "../../../base-component/components/confirm-dialog/confirm-dialog.component";
import {LayoutComponent} from "../../../base-component/components/layout/layout.component";
import {NavbarComponent} from "../../../base-component/components/navbar/navbar.component";
import {ActivatedRoute, Router} from "@angular/router";
import {ClassServiceService} from "../../../services/class-service.service";
import {ClassServiceResponse} from "../../../services/class-service";
import {UserResponse} from "../../../users/users.models";
import {UserService} from "../../../users/services/user.service";
import {FormsModule} from "@angular/forms";

declare var L: any;

@Component({
  selector: 'app-pointing-zone-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    LayoutComponent,
    NavbarComponent,
    FormsModule
  ],
  templateUrl: './pointing-zone-list.component.html',
  styleUrls: ['./pointing-zone-list.component.scss']
})

export class PointingZoneListComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  /* Filtres */
  classId?: string;
  userId?: string;
  selectedFilterClass = '';
  selectedFilterUser = '';
  classes: ClassServiceResponse[] = [];
  users: UserResponse[] = [];

  /* Données */
  zones: ZonePointageResponse[] = [];
  selectedZone: ZonePointageResponse | null = null;
  pageTitle = 'All pointing zones';
  establishmentId?: string;

  /* Map Leaflet */
  private map: any;
  private markers: any[] = [];
  private defaultCenter = [51.505, -0.09];
  private defaultZoom = 13;

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private zoneService: PointingZoneService,
      private classService: ClassServiceService,
      private userService: UserService,
      private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getEstablishmentIdFromStorage();
    this.route.params.subscribe(params => {
      this.classId = params['classId'];
      this.userId = params['userId'];
      this.selectedFilterClass = this.classId || '';
      this.selectedFilterUser = this.userId || '';
      this.updateTitle();
      this.loadFilters();
      this.loadData();
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  /* ----------  MAP  ---------- */
  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement).setView(this.defaultCenter, this.defaultZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private updateMapMarkers(): void {
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    this.zones.forEach(zone => {
      const marker = L.circleMarker([zone.latitude, zone.longitude], {
        radius: 8,
        color: zone.id === this.selectedZone?.id ? '#5E50C5' : '#e74c3c',
        fillColor: zone.id === this.selectedZone?.id ? '#E7E6FB' : '#fadbd8',
        fillOpacity: 0.8,
        weight: 2
      }).addTo(this.map);

      marker.bindPopup(`
        <b>${zone.nom}</b><br>
        Type : ${zone.ownerType}<br>
        Owner : ${this.getOwnerName(zone)}<br>
        Radius : ${zone.rayonMetres} m
      `);

      marker.on('click', () => this.selectZone(zone));
      this.markers.push(marker);
    });

    if (this.zones.length) {
      const group = new L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.2));
    }
  }

  /* ----------  DATA  ---------- */
  private loadData(): void {
    if (this.establishmentId) {
      if (this.classId) {
        this.zoneService.getZonesByClass(this.classId).subscribe(z => {
          this.zones = z;
          this.updateMapMarkers();
        });
      } else if (this.userId) {
        this.zoneService.getZonesByUser(this.userId).subscribe(z => {
          this.zones = z;
          this.updateMapMarkers();
        });
      } else {
        this.zoneService.getAllZonesByEstablishmentId(this.establishmentId).subscribe(z => {
          this.zones = z;
          this.updateMapMarkers();
        });
      }
    }
  }

  private loadFilters(): void {
    if (!this.establishmentId) return;
    this.classService.getClassServicesByEstablishment(this.establishmentId)
        .subscribe(c => this.classes = c);
    this.userService.getUsersByEstablishmentId(this.establishmentId, 0, 300)
        .subscribe(p => this.users = p.content);
  }

  private updateTitle(): void {
    if (this.classId) {
      this.classService.getClassServiceById(this.classId)
          .subscribe(c => this.pageTitle = `Zones – Class ${c.nom}`);
    } else if (this.userId) {
      this.userService.getUserById(this.userId)
          .subscribe(u => this.pageTitle = `Zones – User ${u.firstName} ${u.lastName}`);
    } else {
      this.pageTitle = 'All pointing zones';
    }
  }

  /* ----------  HANDLERS  ---------- */
  onFilterChange(): void {
    this.router.navigate([], {
      queryParams: { classId: this.selectedFilterClass || null, userId: this.selectedFilterUser || null },
      queryParamsHandling: 'merge'
    });
  }

  selectZone(zone: ZonePointageResponse): void {
    this.selectedZone = zone;
    this.updateMapMarkers();
    this.map.setView([zone.latitude, zone.longitude], 15);
  }

  openCreateDialog(): void {
    const ownerType = this.classId ? 'class' : this.userId ? 'user' : undefined;
    const ownerId = this.classId || this.userId;
    this.dialog.open(PointingZoneFormComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: { ownerType, ownerId }
    }).afterClosed().subscribe(() => this.loadData());
  }

  deleteZone(zone: ZonePointageResponse, event: Event): void {
    event.stopPropagation();
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Zone', message: `Delete « ${zone.nom} » ?` }
    }).afterClosed().subscribe(res => {
      if (res) {
        this.zoneService.deleteZone(zone.id).subscribe(() => {
          this.zones = this.zones.filter(z => z.id !== zone.id);
          if (this.selectedZone?.id === zone.id) this.selectedZone = null;
          this.updateMapMarkers();
        });
      }
    });
  }

  getOwnerName(zone: ZonePointageResponse): string {
    return zone.ownerType === OwnerType.CLASS
        ? zone.classServiceName || 'Class'
        : `${zone.userFirstName || ''} ${zone.userLastName || ''}`.trim() || 'User';
  }

  getEstablishmentIdFromStorage(): void {
    const data = sessionStorage.getItem('user_data') || localStorage.getItem('user_data');
    if (data) {
      try {
        this.establishmentId = JSON.parse(data).establishment?.id;
      } catch (e) {
        console.error('Cannot read establishment id', e);
      }
    }
  }
}
