import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {PointingHourService} from '../../pointing-hour.service';
import {PersonalPointingService} from '../../../base-component/services/personal-pointing.service';
import {ClassServiceService} from '../../../services/class-service.service';
import {UserService} from '../../../users/services/user.service';
import {PointingHourRequest} from '../../pointing-hour';
import {ClassServiceResponse} from '../../../services/class-service';
import {UserResponse, UserRole} from '../../../users/users.models';
import {NgClass, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-pointing-hour-form',
  templateUrl: './pointing-hour-form.component.html',
  imports: [
    FormsModule,
    NgClass,
    ReactiveFormsModule,
    NgIf,
    NgForOf
  ],
  styleUrls: ['./pointing-hour-form.component.scss']
})
export class PointingHourFormComponent implements OnInit {
  pointingHourForm!: FormGroup;
  minDateTime: string;
  classServiceId: string = '';
  userId: string = '';
  isEditMode = false;
  pointingHourId?: string;
  availableClassServiceIds: ClassServiceResponse[] = [];
  availableUserIds: UserResponse[] = [];
  availableValidators: UserResponse[] = [];
  establishmentId?: string;
  protected updatingForm = false;

  constructor(
      private fb: FormBuilder,
      private router: Router,
      private route: ActivatedRoute,
      private pointingHourService: PointingHourService,
      private classService: ClassServiceService,
      private userService: UserService,
      private personalPointingService: PersonalPointingService
  ) {
    const now = new Date();
    this.minDateTime = now.toISOString().slice(0, 16);
  }

  ngOnInit(): void {
    this.initForm();
    this.getEstablishmentIdFromStorage();
    this.loadAvailableData(); // CHANGEMENT: Chargement consolidé des données
    this.getRouteParams(); // CHANGEMENT: Gestion des paramètres de route consolidée
    this.checkEditMode();
  }

  initForm(): void {
    this.pointingHourForm = this.fb.group({
      time: ['', [Validators.required, this.futureDateValidator]],
      marge: [0, [Validators.required, Validators.min(0)]],
      classServiceId: [''],
      userId: [''],
      validatorId: [{ value: '', disabled: true }] // CHANGEMENT: Ajout du champ validateur initialement désactivé
    });

    // CHANGEMENT: Écoute des changements pour gérer l'exclusivité et l'activation du validateur
    this.pointingHourForm.get('classServiceId')?.valueChanges.subscribe(value => {
      this.handleClassServiceChange(value);
    });

    this.pointingHourForm.get('userId')?.valueChanges.subscribe(value => {
      this.handleUserChange(value);
    });
  }

  // CHANGEMENT: Gestion des changements de sélection classe/service
  handleClassServiceChange(value: string): void {
    if (this.updatingForm) return;
    this.updatingForm = true;

    try {
      const validatorControl = this.pointingHourForm.get('validatorId');
      const userControl = this.pointingHourForm.get('userId');

      if (value) {
        userControl?.disable({emitEvent: false});
        userControl?.setValue('', {emitEvent: false});
        validatorControl?.enable({emitEvent: false});
        validatorControl?.setValidators([Validators.required]);
      } else {
        userControl?.enable({emitEvent: false});
        if (!userControl?.value) {
          validatorControl?.disable({emitEvent: false});
          validatorControl?.clearValidators();
          validatorControl?.setValue('', {emitEvent: false});
        }
      }
      validatorControl?.updateValueAndValidity({emitEvent: false});
    } finally {
      this.updatingForm = false;
    }
  }

  // CHANGEMENT: Gestion des changements de sélection utilisateur
  handleUserChange(value: string): void {
    if (value) {
      // Vider et désactiver classServiceId
      this.pointingHourForm.patchValue({ classServiceId: '' });
      this.pointingHourForm.get('classServiceId')?.disable();

      // Activer et rendre obligatoire le validateur
      this.pointingHourForm.get('validatorId')?.enable();
      this.pointingHourForm.get('validatorId')?.setValidators([Validators.required]);
      this.pointingHourForm.get('validatorId')?.updateValueAndValidity();
    } else {
      // Réactiver classServiceId
      this.pointingHourForm.get('classServiceId')?.enable();

      // Vérifier s'il faut désactiver le validateur
      if (!this.pointingHourForm.get('classServiceId')?.value) {
        this.pointingHourForm.get('validatorId')?.disable();
        this.pointingHourForm.get('validatorId')?.clearValidators();
        this.pointingHourForm.patchValue({ validatorId: '' });
        this.pointingHourForm.get('validatorId')?.updateValueAndValidity();
      }
    }
  }

  // CHANGEMENT: Consolidation de la récupération des paramètres de route
  getRouteParams(): void {
    this.route.params.subscribe(params => {
      this.classServiceId = params['classId'] || '';
      this.userId = params['userId'] || '';

      if (this.classServiceId) {
        this.pointingHourForm.patchValue({ classServiceId: this.classServiceId });
      }

      if (this.userId) {
        this.pointingHourForm.patchValue({ userId: this.userId });
      }
    });
  }

  checkEditMode(): void {
    this.route.params.subscribe(params => {
      if (params['hourId']) {
        this.isEditMode = true;
        this.pointingHourId = params['hourId'];
        this.loadPointingHourForEdit();
      }
    });
  }

  loadPointingHourForEdit(): void {
    if (this.pointingHourId) {
      this.pointingHourService.getPointingHourById(this.pointingHourId).subscribe({
        next: (hour) => {
          this.pointingHourForm.patchValue({
            time: new Date(hour.startTime).toISOString().slice(0, 16),
            marge: hour.marge,
            classServiceId: hour.classServiceId,
            userId: hour.userId,
            validatorId: hour.validatorId
          });
          if (hour.classServiceId || hour.userId) {
            this.pointingHourForm.get('validatorId')?.enable();
            this.pointingHourForm.get('validatorId')?.setValidators([Validators.required]);
            this.pointingHourForm.get('validatorId')?.updateValueAndValidity();
          }
        },
        error: (err) => console.error('Failed to load pointing hour:', err)
      });
    }
  }

  futureDateValidator(control: any) {
    const selectedDate = new Date(control.value);
    const now = new Date();
    return selectedDate > now ? null : { futureDate: true };
  }

  isFutureDate(): boolean {
    const timeControl = this.pointingHourForm.get('time');
    if (!timeControl?.value) return false;

    const selectedDate = new Date(timeControl.value);
    const now = new Date();
    return selectedDate > now;
  }

  trackByUserId(index: number, user: UserResponse): string {
    return user.id;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.pointingHourForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  // CHANGEMENT: Validation améliorée qui vérifie qu'au moins userId ou classServiceId est sélectionné
  isFormValid(): boolean {
    const hasClassService = this.pointingHourForm.get('classServiceId')?.value;
    const hasUser = this.pointingHourForm.get('userId')?.value;
    const hasValidator = !!this.pointingHourForm.get('validatorId')?.value;
    return this.pointingHourForm.valid &&
        this.isFutureDate() &&
        (hasClassService || hasUser) &&
        (!this.isValidatorEnabled() || hasValidator);
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      const formValue = this.pointingHourForm.value;
      const request: PointingHourRequest = {
        time: new Date(formValue.time),
        marge: formValue.marge,
        classServiceId: formValue.classServiceId || '',
        userId: formValue.userId || '',
        validatorId: formValue.validatorId || '',
      };

      if (this.isEditMode && this.pointingHourId) {
        this.pointingHourService.updatePointingHour(this.pointingHourId, request).subscribe({
          next: () => this.navigateBack(),
          error: (err) => console.error('Error updating pointing hour:', err)
        });
      } else {
        if (formValue.userId) {
          this.personalPointingService.createSchedule(request).subscribe({
            next: () => this.navigateBack(),
            error: (err) => console.error('Error creating personal pointing hour:', err)
          });
        } else {
          this.pointingHourService.createPointingHour(request).subscribe({
            next: () => this.navigateBack(),
            error: (err) => console.error('Error creating pointing hour:', err)
          });
        }
      }
    } else {
      Object.keys(this.pointingHourForm.controls).forEach(key => {
        this.pointingHourForm.get(key)?.markAsTouched();
      });
    }
  }

  // CHANGEMENT: Navigation de retour améliorée
  navigateBack(): void {
    if (this.classServiceId) {
      this.router.navigate(['/schedule']);
    } else if (this.userId) {
      this.router.navigate(['/schedule']);
    } else {
      this.router.navigate(['/class-services']);
    }
  }

  onCancel(): void {
    this.navigateBack();
  }

  // CHANGEMENT: Chargement des données consolidé avec gestion d'erreurs améliorée
  loadAvailableData(): void {
    if (!this.establishmentId) {
      console.error('Establishment ID is null or undefined');
      return;
    }

    // Charger les classes/services
    this.classService.getClassServicesByEstablishment(this.establishmentId).subscribe({
      next: (classes) => {
        this.availableClassServiceIds = classes;
      },
      error: (err) => console.error('Failed to load available class service IDs:', err)
    });

    // Charger les utilisateurs
    this.userService.getUsersByEstablishmentId(this.establishmentId, 0, 300).subscribe({
      next: (page) => {
        this.availableUserIds = page.content;
        this.availableValidators = page.content.filter(u => u.role!=UserRole.USER);
      },
      error: (err) => console.error('Failed to load available user IDs:', err)
    });
  }

  getEstablishmentIdFromStorage() {
    const userData = sessionStorage.getItem('user_data') || localStorage.getItem('user_data');

    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.establishmentId = user.establishment?.id || null;
      } catch (e) {
        console.error('Error parsing user data from storage', e);
      }
    }
  }

  // CHANGEMENT: Méthode utilitaire pour vérifier si le validateur est activé
  isValidatorEnabled(): boolean {
    return this.pointingHourForm.get('validatorId')?.enabled || false;
  }
}