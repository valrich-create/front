import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import { Router } from "@angular/router";
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

  constructor(
      private fb: FormBuilder,
      private router: Router,
      private pointingHourService: PointingHourService
  ) {
    // Set minimum datetime to current time
    const now = new Date();
    this.minDateTime = now.toISOString().slice(0, 16);
  }

  ngOnInit(): void {
    this.initForm();
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
        classServiceId: this.classServiceId
      };

      this.pointingHourService.createPointingHour(request).subscribe({
        next: (response) => {
          this.router.navigate(['/pointing-hours']);
        },
        error: (error) => {
          console.error('Error creating pointing hour:', error);
          // Handle error (show toast, etc.)
        }
      });
    } else {
      Object.keys(this.pointingHourForm.controls).forEach(key => {
        const control = this.pointingHourForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/pointing-hours']);
  }
}