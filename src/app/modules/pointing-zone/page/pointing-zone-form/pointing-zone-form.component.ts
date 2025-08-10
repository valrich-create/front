import {Component, OnInit, ViewChild, ElementRef, AfterViewInit, PLATFORM_ID, Inject} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  ValidatorFn,
  AbstractControl, ValidationErrors
} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {PointingZoneService} from "../../pointing-zone.service";
import {ZonePointageRequest} from "../../pointing-zone";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {ClassServiceService} from "../../../services/class-service.service";
import {ClassServiceResponse} from "../../../services/class-service";
import {UserResponse} from "../../../users/users.models";
import {UserService} from "../../../users/services/user.service";
import {PersonalPointingService} from "../../../base-component/services/personal-pointing.service";

@Component({
  selector: 'app-zone-pointage-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
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
  private defaultCenter = [4.0511, 9.7679];
  private defaultZoom = 13;

  // Données pour les sélections
  availableClassServices: ClassServiceResponse[] = [];
  availableUsers: UserResponse[] = [];

  // Contexte route / dialog
  classServiceId?: string;
  userId?: string;
  establishmentId = '';

  showIdSelection = false;
  isBrowser = false;

  constructor(
      private fb: FormBuilder,
      private router: Router,
      private route: ActivatedRoute,
      private zoneService: PointingZoneService,
      private personalPointingService: PersonalPointingService,
      private classService: ClassServiceService,
      private userService: UserService,
      @Inject(PLATFORM_ID) private platformId: Object,
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.getEstablishmentIdFromStorage();
    this.initForm();
    this.getClassServiceId();
    this.getUserId();
    this.loadSelectionData();

    if (this.isBrowser) this.loadLeaflet();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) this.initMap();
  }

  /* ----------  GESTION DES IDs DEPUIS LA ROUTE  ---------- */
  getClassServiceId(): void {
    this.route.params.subscribe(params => {
      this.classServiceId = params['classId'];
      if (this.classServiceId) {
        this.zoneForm.patchValue({ classServiceId: this.classServiceId });
        this.zoneForm.get('userId')?.disable();
        this.zoneForm.get('userId')?.setValue(null);
      }
    });
  }

  getUserId(): void {
    this.route.params.subscribe(params => {
      this.userId = params['userId'];
      if (this.userId) {
        this.zoneForm.patchValue({ userId: this.userId });
        this.zoneForm.get('classServiceId')?.disable();
        this.zoneForm.get('classServiceId')?.setValue(null);
      }
    });
  }

  /* ----------  CHARGEMENT DES DONNÉES DE SÉLECTION  ---------- */
  loadSelectionData(): void {
    // Charger les classes/services
    this.classService.getClassServicesByEstablishment(this.establishmentId).subscribe({
      next: (classes) => {
        this.availableClassServices = classes;
        this.showIdSelection = true;
      },
      error: (err) => console.error('Failed to load available class services:', err)
    });

    // Charger les utilisateurs
    this.userService.getUsersByEstablishmentId(this.establishmentId, 0, 300).subscribe({
      next: (page) => {
        this.availableUsers = page.content;
        this.showIdSelection = true;
      },
      error: (err) => console.error('Failed to load available users:', err)
    });
  }

  /* ----------  GESTION DES SÉLECTIONS MUTUELLEMENT EXCLUSIVES  ---------- */
  onClassServiceChange(classServiceId: string): void {
    if (classServiceId) {
      this.zoneForm.get('userId')?.disable();
      this.zoneForm.get('userId')?.setValue(null);
      this.zoneForm.patchValue({ classServiceId: classServiceId });
    } else {
      this.zoneForm.get('userId')?.enable();
      this.zoneForm.patchValue({ classServiceId: null });
    }
  }

  onUserChange(userId: string): void {
    if (userId) {
      this.zoneForm.get('classServiceId')?.disable();
      this.zoneForm.get('classServiceId')?.setValue(null);
      this.zoneForm.patchValue({ userId: userId });
    } else {
      this.zoneForm.get('classServiceId')?.enable();
      this.zoneForm.patchValue({ userId: null });
    }
  }

  /* ----------  INITIALISATION DU FORMULAIRE  ---------- */
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
      classServiceId: [null],
      userId: [null],
      establishmentId: [this.establishmentId, [Validators.required]],
    });

    // Validation personnalisée : soit classServiceId soit userId doit être sélectionné
    this.zoneForm.setValidators(this.atLeastOneSelectedValidator);

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

    this.setupFormListeners();
  }

  /* ----------  VALIDATEUR PERSONNALISÉ  ---------- */
  atLeastOneSelectedValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const classServiceId = formGroup.get('classServiceId')?.value;
    const userId = formGroup.get('userId')?.value;

    if (!classServiceId && !userId) {
      return { atLeastOneRequired: true };
    }
    return null;
  }

  /* ----------  LEAFLET MAP  ---------- */
  private async loadLeaflet() {
    try {
      const L = await import('leaflet');
      this.leaflet = L.default;
      this.initMap();
    } catch (error) {
      console.error('Failed to load Leaflet:', error);
    }
  }

  initMap(): void {
    if (!this.leaflet) return;
    const initialLat = this.zoneForm.value.latitude;
    const initialLng = this.zoneForm.value.longitude;

    this.map = this.leaflet.map(this.mapContainer.nativeElement).setView(
        [initialLat, initialLng],
        this.defaultZoom
    );

    this.leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.updateMapFeatures();

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
      color: '#28a745',
      fillColor: '#28a74530',
      fillOpacity: 0.5,
      radius: radius
    }).addTo(this.map);

    // Center map
    this.map.setView([lat, lng], this.map.getZoom());
  }

  /* ----------  VALIDATION ET SUBMIT  ---------- */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.zoneForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  hasSelectionError(): boolean {
    return this.zoneForm.errors?.['atLeastOneRequired'] &&
        (this.zoneForm.get('classServiceId')?.touched || this.zoneForm.get('userId')?.touched);
  }

  setupFormListeners(): void {
    this.zoneForm.get('radius')?.valueChanges.subscribe(() => {
      if (this.zoneForm.get('radius')?.valid) {
        this.updateMapFeatures();
      }
    });
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
        classeServiceId: formValue.classServiceId,
        userId: formValue.userId,
        etablissementId: this.establishmentId,
      };

      console.log('Zone de pointage à créer:', request);

      if (formValue.userId || this.userId) {
        this.submitForUser(request);
      } else {
        this.submitForClassService(request);
      }
    } else {
      this.markAllAsTouched();
    }
  }

  private submitForUser(request: ZonePointageRequest): void {
    this.personalPointingService.createZone(request).subscribe({
      next: (response) => {
        console.log('Zone créée avec succès pour utilisateur:', response);
        this.router.navigate(['/zones']);
      },
      error: (error) => {
        console.error('Erreur lors de la création pour utilisateur:', error);
      }
    });
  }

  private submitForClassService(request: ZonePointageRequest): void {
    this.zoneService.createZone(request).subscribe({
      next: (response) => {
        console.log('Zone créée avec succès pour classe/service:', response);
        this.router.navigate(['/zones']);
      },
      error: (error) => {
        console.error('Erreur lors de la création pour classe/service:', error);
      }
    });
  }

  private markAllAsTouched(): void {
    Object.keys(this.zoneForm.controls).forEach(key => {
      this.zoneForm.get(key)?.markAsTouched();
    });
  }


onCancel(): void {
    this.router.navigate(['/zones']);
  }

  private getEstablishmentIdFromStorage(): void {
    const data = sessionStorage.getItem('user_data') || localStorage.getItem('user_data');
    if (data) {
      try {
        this.establishmentId = JSON.parse(data).establishment?.id || '';
      } catch (e) {
        console.error('Cannot read establishment id', e);
      }
    }
  }
}