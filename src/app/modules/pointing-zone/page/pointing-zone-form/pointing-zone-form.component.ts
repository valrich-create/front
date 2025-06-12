import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../../base-component/components/layout/layout.component';
import { NavbarComponent } from '../../../base-component/components/navbar/navbar.component';
import {PointingZoneService} from "../../pointing-zone.service";
import {ZonePointageRequest} from "../../pointing-zone";

declare var L: any;

@Component({
  selector: 'app-zone-pointage-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LayoutComponent,
    NavbarComponent
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
  private defaultCenter = [51.505, -0.09]; // Default center (London)
  private defaultZoom = 13;

  constructor(
      private fb: FormBuilder,
      private router: Router,
      private zoneService: PointingZoneService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupFormListeners();
  }

  ngAfterViewInit(): void {
    this.initMap();
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
      classServiceId: ['', [Validators.required]],
      establishmentId: ['', [Validators.required]]
    });
  }

  initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement).setView(
        [this.zoneForm.value.latitude, this.zoneForm.value.longitude],
        this.defaultZoom
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add initial marker
    this.updateMapFeatures();

    // Handle map clicks
    this.map.on('click', (e: any) => {
      this.zoneForm.patchValue({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      });
      this.updateMapFeatures();
    });
  }

  setupFormListeners(): void {
    // Update map when coordinates change
    this.zoneForm.get('latitude')?.valueChanges.subscribe(() => {
      if (this.zoneForm.get('latitude')?.valid) {
        this.updateMapFeatures();
      }
    });

    this.zoneForm.get('longitude')?.valueChanges.subscribe(() => {
      if (this.zoneForm.get('longitude')?.valid) {
        this.updateMapFeatures();
      }
    });

    this.zoneForm.get('radius')?.valueChanges.subscribe(() => {
      if (this.zoneForm.get('radius')?.valid) {
        this.updateMapFeatures();
      }
    });
  }

  updateMapFeatures(): void {
    const lat = this.zoneForm.value.latitude;
    const lng = this.zoneForm.value.longitude;
    const radius = this.zoneForm.value.radius;

    // Clear previous features
    if (this.marker) this.map.removeLayer(this.marker);
    if (this.circle) this.map.removeLayer(this.circle);

    // Add new marker
    this.marker = L.marker([lat, lng]).addTo(this.map);

    // Add circle
    this.circle = L.circle([lat, lng], {
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

  onSubmit(): void {
    if (this.zoneForm.valid) {
      const formValue = this.zoneForm.value;
      const request: ZonePointageRequest = {
        nom: formValue.name,
        latitude: formValue.latitude,
        longitude: formValue.longitude,
        rayonMetres: formValue.radius,
        description: formValue.description,
        classServiceId: formValue.classServiceId,
        establishmentId: formValue.establishmentId
      };

      this.zoneService.createZone(request).subscribe({
        next: (response) => {
          this.router.navigate(['/zones']);
        },
        error: (error) => {
          console.error('Error creating zone:', error);
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