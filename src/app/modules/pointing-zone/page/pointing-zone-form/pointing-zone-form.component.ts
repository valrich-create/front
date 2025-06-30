import {Component, OnInit, ViewChild, ElementRef, AfterViewInit, PLATFORM_ID, Inject} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import { LayoutComponent } from '../../../base-component/components/layout/layout.component';
import { NavbarComponent } from '../../../base-component/components/navbar/navbar.component';
import {PointingZoneService} from "../../pointing-zone.service";
import {ZonePointageRequest} from "../../pointing-zone";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {ClassServiceService} from "../../../services/class-service.service";


@Component({
  selector: 'app-zone-pointage-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: 'pointing-zone-form.component.html',
  styleUrls: ['pointing-zone-form.component.scss']
})

export class PointingZoneFormComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  zoneForm!: FormGroup;
  private map: any;
  private marker: any;
  private circle: any;
  private leaflet: any;
  private defaultCenter = [4.0511, 9.7679]; // Default center (London)
  private defaultZoom = 13;
  private classId: string;
  private establishmentId: string='';

  isBrowser = false;

  constructor(
      private fb: FormBuilder,
      private router: Router,
      private zoneService: PointingZoneService,
      private classService: ClassServiceService,
      @Inject(PLATFORM_ID) private platformId: Object,
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.classId = data.classId;
  }

  ngOnInit(): void {
    this.loadClassDetails();
    this.initForm();
    this.setupFormListeners();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadLeaflet();
    }
  }

  private loadClassDetails(): void {
    this.classService.getClassServiceById(this.classId).subscribe({
      next: (classDetails) => {
        if (!classDetails.establishment?.id) {
          throw new Error('Establishment ID not found in class details');
        }
        this.establishmentId = classDetails.establishment.id;
        this.initForm(); // Initialisez le formulaire une fois les données chargées
        this.setupFormListeners();
      },
      error: (err) => console.error('Failed to load class details', err)
    });
  }

  private async loadLeaflet() {
    try {
      const L = await import('leaflet');
      this.leaflet = L.default;
      this.initMap();
    } catch (error) {
      console.error('Failed to load Leaflet:', error);
    }
  }

  initForm(): void {
    this.zoneForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      latitude: [this.defaultCenter[0], [
        Validators.required,
        Validators.min(-90),
        Validators.max(90)
      ]],
      longitude: [this.defaultCenter[1], [
        Validators.required,
        Validators.min(-180),
        Validators.max(180)
      ]],
      radius: [100, [
        Validators.required,
        Validators.min(1),
        Validators.max(10000)
      ]],
      description: ['', [Validators.maxLength(500)]],
      classServiceId: [this.classId, [Validators.required]],
      establishmentId: [this.establishmentId, [Validators.required]]
    });

    this.zoneForm.get('latitude')?.valueChanges.subscribe(lat => {
      if (this.zoneForm.get('latitude')?.valid &&
          this.zoneForm.get('longitude')?.valid) {
        this.updateMapFromForm();
      }
    });

    this.zoneForm.get('longitude')?.valueChanges.subscribe(lng => {
      if (this.zoneForm.get('latitude')?.valid &&
          this.zoneForm.get('longitude')?.valid) {
        this.updateMapFromForm();
      }
    });
  }

  initMap(): void {
    if (!this.leaflet) return;

    // this.map = this.leaflet.map(this.mapContainer.nativeElement).setView(
    //     [this.zoneForm.value.latitude, this.zoneForm.value.longitude],
    //     this.defaultZoom
    // );

    const initialLat = this.zoneForm.value.latitude;
    const initialLng = this.zoneForm.value.longitude;

    this.map = this.leaflet.map(this.mapContainer.nativeElement).setView(
        [initialLat, initialLng],
        this.defaultZoom
    );

    this.leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add initial marker
    this.updateMapFeatures();

    // Handle map clicks
    this.map.on('click', (e: any) => {
      this.zoneForm.patchValue({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      }, { emitEvent: false });
      this.updateMapFeatures();
    });
  }

  updateMapFromForm(): void {
    if (!this.leaflet || !this.map) return;

    const lat = this.zoneForm.value.latitude;
    const lng = this.zoneForm.value.longitude;

    this.map.setView([lat, lng]);
    this.updateMapFeatures();
  }

  setupFormListeners(): void {
    // Update map when coordinates change
    // this.zoneForm.get('latitude')?.valueChanges.subscribe(() => {
    //   if (this.zoneForm.get('latitude')?.valid) {
    //     this.updateMapFeatures();
    //   }
    // });
    //
    // this.zoneForm.get('longitude')?.valueChanges.subscribe(() => {
    //   if (this.zoneForm.get('longitude')?.valid) {
    //     this.updateMapFeatures();
    //   }
    // });

    this.zoneForm.get('radius')?.valueChanges.subscribe(() => {
      if (this.zoneForm.get('radius')?.valid) {
        this.updateMapFeatures();
      }
    });
  }

  updateMapFeatures(): void {
    if (!this.leaflet || !this.map) return;

    const lat = this.zoneForm.value.latitude;
    const lng = this.zoneForm.value.longitude;
    const radius = this.zoneForm.value.radius;

    // Clear previous features
    if (this.marker) this.map.removeLayer(this.marker);
    if (this.circle) this.map.removeLayer(this.circle);

    // Add new marker
    this.marker = this.leaflet.marker([lat, lng]).addTo(this.map);

    // Add circle
    this.circle = this.leaflet.circle([lat, lng], {
      color: '#5E50C5',
      fillColor: '#E7E6FB',
      fillOpacity: 0.5,
      radius: radius
    }).addTo(this.map);

    // Center map
    this.map.setView([lat, lng], this.map.getZoom());
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.zoneForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  onCoordinatesChange(): void {
    if (this.zoneForm.get('latitude')?.valid && this.zoneForm.get('longitude')?.valid) {
      this.updateMapFeatures();
    }
  }

  onSubmit(): void {
    if (this.zoneForm.valid) {
      const formValue = this.zoneForm.value;
      const request: ZonePointageRequest = {
        nom: formValue.name,
        latitude: formValue.latitude,
        longitude: formValue.longitude,
        rayonMetres: formValue.radius,
        description: formValue.description,
        classeServiceId: this.classId,
        etablissementId: this.establishmentId
      };

      console.log('Class Id: ',this.classId);
      console.log('Establishment Id :', this.establishmentId);
      this.zoneService.createZone(request).subscribe({
        next: (response) => {
          this.router.navigate(['/zones']);
        },
        error: (error) => {
          console.error('Full error:', error);
          console.error('Error details:', error.error);
        }
      });
    } else {
      Object.keys(this.zoneForm.controls).forEach(key => {
        this.zoneForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/zones']);
  }
}