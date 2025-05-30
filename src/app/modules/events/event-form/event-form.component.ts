import {Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { LayoutComponent } from "../../base-component/components/layout/layout.component";
import { NavbarComponent } from "../../base-component/components/navbar/navbar.component";
import { HttpClientModule } from "@angular/common/http";
import {EventService} from "../events.service";

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LayoutComponent,
    NavbarComponent,
    HttpClientModule
  ],
  templateUrl: "event-form.component.html",
  styleUrls: ["event-form.component.scss"]
})

export class EventFormComponent implements OnInit {
  informationForm!: FormGroup;
  descriptionLength: number = 0;
  establishmentId: string | null = null;

  constructor(
      private fb: FormBuilder,
      private router: Router,
      private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getEstablishmentIdFromStorage();

    this.informationForm.get('description')?.valueChanges.subscribe((value) => {
      this.descriptionLength = value ? value.length : 0;
    });

    // Watch isImportant changes to show/hide date fields
    this.informationForm.get('isImportant')?.valueChanges.subscribe((isImportant) => {
      if (isImportant) {
        this.informationForm.get('importanceDisplayStartDate')?.setValidators([Validators.required]);
        this.informationForm.get('importanceDisplayEndDate')?.setValidators([Validators.required]);
      } else {
        this.informationForm.get('importanceDisplayStartDate')?.clearValidators();
        this.informationForm.get('importanceDisplayEndDate')?.clearValidators();
      }
      this.informationForm.get('importanceDisplayStartDate')?.updateValueAndValidity();
      this.informationForm.get('importanceDisplayEndDate')?.updateValueAndValidity();
    });
  }

  getEstablishmentIdFromStorage() {
    const userData = sessionStorage.getItem('user_data') || localStorage.getItem('user_data');

    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.establishmentId = user.establishment?.id || null;

        if (this.establishmentId) {
          this.informationForm.patchValue({
            establishmentId: this.establishmentId
          });
        } else {
          console.warn('No establishment ID found in user data');
        }
      } catch (e) {
        console.error('Error parsing user data from storage', e);
      }
    }
  }

  initForm(): void {
    this.informationForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(3000)]],
      isImportant: [false],
      importanceDisplayStartDate: [null],
      importanceDisplayEndDate: [null],
      establishmentId: ['', [Validators.required]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.informationForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  onSubmit(): void {
    if (this.informationForm.valid) {
      const formValue = this.informationForm.value;

      // Format dates if isImportant is true
      if (formValue.isImportant) {
        formValue.importanceDisplayStartDate = new Date(formValue.importanceDisplayStartDate).toISOString();
        formValue.importanceDisplayEndDate = new Date(formValue.importanceDisplayEndDate).toISOString();
      } else {
        delete formValue.importanceDisplayStartDate;
        delete formValue.importanceDisplayEndDate;
      }

      this.eventService.createInformation(formValue).subscribe({
        next: (response) => {
          // Navigate back or show success message
          this.router.navigate(['/events']);
        },
        error: (error) => {
          console.error('Error creating information:', error);
          // Handle error (show toast, etc.)
        }
      });
    } else {
      Object.keys(this.informationForm.controls).forEach(key => {
        const control = this.informationForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/events']);
  }
}