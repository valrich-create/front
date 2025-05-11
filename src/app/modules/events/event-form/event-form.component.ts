import { Component } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {CommonModule} from "@angular/common";
import {LayoutComponent} from "../../base-component/components/layout/layout.component";
import {NavbarComponent} from "../../base-component/components/navbar/navbar.component";

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LayoutComponent, NavbarComponent],
  templateUrl: "./event-form.component.html",
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent {
  eventForm!: FormGroup;
  detailsLength: number = 0;

  constructor(
      private fb: FormBuilder,
      private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Subscribe to changes in the details field to update character count
    this.eventForm.get('details')?.valueChanges.subscribe((value) => {
      this.detailsLength = value ? value.length : 0;
    });
  }

  initForm(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required]],
      details: ['', [Validators.required, Validators.maxLength(3000)]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.eventForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      // Process the form data here
      console.log('Form submitted:', this.eventForm.value);

      // Navigate back to events list or show confirmation
      // this.router.navigate(['/events']);
    } else {
      // Mark all fields as touched to display validation errors
      Object.keys(this.eventForm.controls).forEach(key => {
        const control = this.eventForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    // Navigate back or clear form
    // this.router.navigate(['/events']);
  }
}
