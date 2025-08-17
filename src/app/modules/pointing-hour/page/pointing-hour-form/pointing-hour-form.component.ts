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
import {ToastService} from "../../../base-component/services/toast/toast.service";

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
  private endTimeTouchedManually = false; // Track manual endTime modifications

  constructor(
      private fb: FormBuilder,
      private router: Router,
      private route: ActivatedRoute,
      private pointingHourService: PointingHourService,
      private classService: ClassServiceService,
      private userService: UserService,
      private toastService: ToastService,
      private personalPointingService: PersonalPointingService
  ) {
    const now = new Date();
    this.minDateTime = now.toISOString().slice(0, 16);
  }

  ngOnInit(): void {
    this.initForm();
    this.getEstablishmentIdFromStorage();
    this.loadAvailableData();
    this.getRouteParams();
    this.checkEditMode();
  }

  initForm(): void {
    this.pointingHourForm = this.fb.group({
      startTime: ['', [Validators.required, this.futureDateValidator]],
      marge: [0, [Validators.required, Validators.min(0)]],
      endTime: ['', [Validators.required, this.endTimeValidator.bind(this)]],
      classServiceId: [''],
      userId: [''],
      validatorId: [{ value: '', disabled: true }]
    });

    // Gestion des changements pour l'exclusivité et l'activation du validateur
    this.pointingHourForm.get('classServiceId')?.valueChanges.subscribe(value => {
      this.handleClassServiceChange(value);
    });

    this.pointingHourForm.get('userId')?.valueChanges.subscribe(value => {
      this.handleUserChange(value);
    });

    // NOUVEAU: Logique de calcul automatique pour startTime et marge
    this.pointingHourForm.get('startTime')?.valueChanges.subscribe(() => {
      this.calculateEndTimeFromMargeIfNotTouched();
    });

    this.pointingHourForm.get('marge')?.valueChanges.subscribe(() => {
      this.calculateEndTimeFromMargeIfNotTouched();
    });

    // NOUVEAU: Logique pour endTime modifié manuellement
    this.pointingHourForm.get('endTime')?.valueChanges.subscribe(() => {
      if (!this.updatingForm) {
        this.endTimeTouchedManually = true;
        this.calculateMargeFromEndTime();
      }
    });
  }

  // NOUVEAU: Calculer endTime automatiquement si pas touché manuellement
  private calculateEndTimeFromMargeIfNotTouched(): void {
    if (this.updatingForm) return;

    const startTime = this.pointingHourForm.get('startTime')?.value;
    const marge = this.pointingHourForm.get('marge')?.value;

    // Calculer endTime si on a startTime et marge, même si endTime a été touché (sauf en cas de modification manuelle active)
    if (startTime && marge !== null && marge !== undefined && marge >= 0) {
      this.updatingForm = true;
      try {
        const startDate = new Date(startTime);
        const endDate = new Date(startDate.getTime() + (marge * 60000)); // marge en minutes -> millisecondes
        const endTimeString = endDate.toISOString().slice(0, 16);

        this.pointingHourForm.get('endTime')?.setValue(endTimeString, { emitEvent: false });
      } catch (error) {
        console.error('Erreur lors du calcul de endTime:', error);
      } finally {
        this.updatingForm = false;
      }
    }
  }

  // NOUVEAU: Calculer la marge à partir de endTime
  private calculateMargeFromEndTime(): void {
    if (this.updatingForm) return;

    const startTime = this.pointingHourForm.get('startTime')?.value;
    const endTime = this.pointingHourForm.get('endTime')?.value;

    if (startTime && endTime) {
      this.updatingForm = true;
      try {
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);
        const diffInMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

        // Seulement si la différence est positive
        if (diffInMinutes >= 0) {
          this.pointingHourForm.get('marge')?.setValue(diffInMinutes, { emitEvent: false });
        }
      } catch (error) {
        console.error('Erreur lors du calcul de la marge:', error);
      } finally {
        this.updatingForm = false;
      }
    }
  }

  // NOUVEAU: Validateur pour endTime
  endTimeValidator(control: any) {
    if (!control.value) return { required: true };

    const startTime = this.pointingHourForm?.get('startTime')?.value;
    if (!startTime) return null;

    const startDate = new Date(startTime);
    const endDate = new Date(control.value);

    if (endDate <= startDate) {
      return { endTimeBeforeStart: true };
    }

    return null;
  }

  // NOUVEAU: Réinitialiser le flag endTimeTouchedManually lors du chargement en mode édition
  private resetEndTimeTouchedFlag(): void {
    this.endTimeTouchedManually = false;
  }

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

  handleUserChange(value: string): void {
    if (value) {
      this.pointingHourForm.patchValue({ classServiceId: '' });
      this.pointingHourForm.get('classServiceId')?.disable();

      this.pointingHourForm.get('validatorId')?.enable();
      this.pointingHourForm.get('validatorId')?.setValidators([Validators.required]);
      this.pointingHourForm.get('validatorId')?.updateValueAndValidity();
    } else {
      this.pointingHourForm.get('classServiceId')?.enable();

      if (!this.pointingHourForm.get('classServiceId')?.value) {
        this.pointingHourForm.get('validatorId')?.disable();
        this.pointingHourForm.get('validatorId')?.clearValidators();
        this.pointingHourForm.patchValue({ validatorId: '' });
        this.pointingHourForm.get('validatorId')?.updateValueAndValidity();
      }
    }
  }

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
          this.updatingForm = true;
          this.resetEndTimeTouchedFlag(); // NOUVEAU: Réinitialiser le flag

          // Calculer endTime à partir de startTime et marge
          const startTime = new Date(hour.startTime).toISOString().slice(0, 16);
          const endDate = new Date(hour.startTime);
          endDate.setMinutes(endDate.getMinutes() + hour.marge);
          const endTime = endDate.toISOString().slice(0, 16);

          this.pointingHourForm.patchValue({
            startTime: startTime,
            marge: hour.marge,
            endTime: endTime, // NOUVEAU: Calculé automatiquement
            classServiceId: hour.classServiceId,
            userId: hour.userId,
            validatorId: hour.validatorId
          });

          if (hour.classServiceId || hour.userId) {
            this.pointingHourForm.get('validatorId')?.enable();
            this.pointingHourForm.get('validatorId')?.setValidators([Validators.required]);
            this.pointingHourForm.get('validatorId')?.updateValueAndValidity();
          }

          this.updatingForm = false;
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
    const timeControl = this.pointingHourForm.get('startTime');
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
        startTime: new Date(formValue.startTime), // MODIFIÉ: time -> startTime
        endTime: new Date(formValue.endTime), // NOUVEAU: Ajout de endTime
        marge: formValue.marge,
        classServiceId: formValue.classServiceId || '',
        userId: formValue.userId || '',
        validatorId: formValue.validatorId || '',
      };

      if (this.isEditMode && this.pointingHourId) {
        this.pointingHourService.updatePointingHour(this.pointingHourId, request).subscribe({
          next: (response) => {
            this.toastService.success("Operation reussie");
            this.navigateBack();
          },
          error: (err) => {
            this.toastService.error(err.message);
            console.error('Error updating pointing hour:', err);
          }
        });
      } else {
        if (formValue.userId) {
          this.personalPointingService.createSchedule(request).subscribe({
            next: () => {
              this.toastService.success("Operation reussie");
              this.navigateBack()
            },
            error: (err) => {
              console.error('Error creating personal pointing hour:', err);
              this.toastService.error(err.error.message || err.message);
            }
          });
        } else {
          this.pointingHourService.createPointingHour(request).subscribe({
            next: () => {
              this.navigateBack();
              this.toastService.success("Operation reussie");
            },
            error: (err) => {
              this.toastService.error(err.error.message || err.message);
              console.error('Error creating pointing hour:', err)
            }
          });
        }
      }
    } else {
      Object.keys(this.pointingHourForm.controls).forEach(key => {
        this.pointingHourForm.get(key)?.markAsTouched();
      });
    }
  }

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

  loadAvailableData(): void {
    if (!this.establishmentId) {
      console.error('Establishment ID is null or undefined');
      return;
    }

    this.classService.getClassServicesByEstablishment(this.establishmentId).subscribe({
      next: (classes) => {
        this.availableClassServiceIds = classes;
      },
      error: (err) => {
        this.toastService.error(err.error.message || err.message);
        console.error('Failed to load available class service IDs:', err)
      }
    });

    this.userService.getUsersByEstablishmentId(this.establishmentId, 0, 300).subscribe({
      next: (page) => {
        this.availableUserIds = page.content;
        this.availableValidators = page.content.filter(u => u.role!=UserRole.USER);
      },
      error: (err) => {
        this.toastService.error(err.error.message || err.message);
        console.error('Failed to load available user IDs:', err)
      }
    });
  }

  getEstablishmentIdFromStorage() {
    const userData = sessionStorage.getItem('user_data') || localStorage.getItem('user_data');

    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.establishmentId = user.establishment?.id || null;
      } catch (e) {
        this.toastService.error("Impossible de lire votre organisation")
        console.error('Error parsing user data from storage', e);
      }
    }
  }

  isValidatorEnabled(): boolean {
    return this.pointingHourForm.get('validatorId')?.enabled || false;
  }
}