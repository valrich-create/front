import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import { CommonModule } from "@angular/common";
import {LayoutComponent} from "../../../base-component/components/layout/layout.component";
import {NavbarComponent} from "../../../base-component/components/navbar/navbar.component";
import {PointingHourService} from "../../pointing-hour.service";
import {PointingHourRequest} from "../../pointing-hour";

@Component({
  selector: 'app-pointing-hour-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LayoutComponent,
    NavbarComponent
  ],
  templateUrl: "pointing-hour-form.component.html",
  styleUrls: ["pointing-hour-form.component.scss"]
})

export class PointingHourFormComponent implements OnInit {
  pointingHourForm!: FormGroup;
  minDateTime: string;
  classServiceId: string = ''; // Will be set from route or service
  isEditMode = false;
  pointingHourId?: string;

  constructor(
      private fb: FormBuilder,
      private router: Router,
      private route: ActivatedRoute,
      private pointingHourService: PointingHourService
  ) {
    const now = new Date();
    this.minDateTime = now.toISOString().slice(0, 16);
  }

  ngOnInit(): void {
    this.initForm();
    this.getClassServiceId();
    this.checkEditMode();
    // TODO : Here you would get the classServiceId from route params or service
    // this.getClassServiceId();
  }

  initForm(): void {
    this.pointingHourForm = this.fb.group({
      time: ['', [Validators.required, this.futureDateValidator]],
      marge: [0, [Validators.required, Validators.min(0)]],
      classServiceId: [this.classServiceId, [Validators.required]]
    });
  }

  getClassServiceId(): void {
    this.route.params.subscribe(params => {
      this.classServiceId = params['classId'];
      this.pointingHourForm.patchValue({ classServiceId: this.classServiceId });
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
            classServiceId: hour.classServiceId
          });
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.pointingHourForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  onSubmit(): void {
    if (this.pointingHourForm.valid && this.isFutureDate()) {
      const formValue = this.pointingHourForm.value;
      const request: PointingHourRequest = {
        time: new Date(formValue.time),
        marge: formValue.marge,
        classServiceId: formValue.classServiceId
      };

      if (this.isEditMode && this.pointingHourId) {
        this.pointingHourService.updatePointingHour(this.pointingHourId, request).subscribe({
          next: () => this.router.navigate(['/classes', this.classServiceId, 'pointing-hours']),
          error: (err) => console.error('Error updating pointing hour:', err)
        });
      } else {
        this.pointingHourService.createPointingHour(request).subscribe({
          next: () => this.router.navigate(['/classes', this.classServiceId, 'pointing-hours']),
          error: (err) => console.error('Error creating pointing hour:', err)
        });
      }
    } else {
      Object.keys(this.pointingHourForm.controls).forEach(key => {
        this.pointingHourForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/classes', this.classServiceId, 'pointing-hours']);
  }
}