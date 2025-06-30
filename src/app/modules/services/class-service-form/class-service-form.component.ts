import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { NgClass, NgIf } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { ClassServiceService } from "../class-service.service";
import { ClassServiceRequest, ClassServiceResponse, ClassServiceUpdateRequest } from "../class-service";
import {LayoutComponent} from "../../base-component/components/layout/layout.component";
import {NavbarComponent} from "../../base-component/components/navbar/navbar.component";
import {ToastService} from "../../base-component/services/toast/toast.service";

@Component({
  selector: 'app-class-service-form',
  standalone: true,
  imports: [
    FormsModule,
    LayoutComponent,
    NavbarComponent,
    NgIf,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: 'class-service-form.component.html',
  styleUrls: ['class-service-form.component.scss']
})
export class ClassServiceFormComponent implements OnInit {
  classServiceForm: FormGroup;
  isEditMode = false;
  classServiceId: string | null = null;
  establishmentId: string | null = null;

  constructor(
      private fb: FormBuilder,
      private classServiceService: ClassServiceService,
      private toastService: ToastService,
      private router: Router,
      private route: ActivatedRoute
  ) {
    this.classServiceForm = this.fb.group({
      nom: ['', Validators.required],
      description: [''],
      establishmentId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.classServiceId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.classServiceId;
    this.getEstablishmentIdFromStorage();

    if (this.isEditMode && this.classServiceId) {
      this.loadClassServiceData();
    }
  }

  loadClassServiceData(): void {
    this.classServiceService.getClassServiceById(this.classServiceId!).subscribe({
      next: (classService: ClassServiceResponse) => {
        this.classServiceForm.patchValue({
          nom: classService.nom,
          description: classService.description,
          establishmentId: classService.establishment?.id
        });
      },
      error: (error) => {
        console.error('Error loading class/service:', error);
      }
    });
  }

  getEstablishmentIdFromStorage(): void {
    const userData = sessionStorage.getItem('user_data') || localStorage.getItem('user_data');

    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.establishmentId = user.establishment?.id || null;

        if (this.establishmentId) {
          this.classServiceForm.patchValue({
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.classServiceForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  onSubmit(): void {
    if (this.classServiceForm.valid) {
      if (this.isEditMode && this.classServiceId) {
        const updateRequest: ClassServiceUpdateRequest = this.classServiceForm.value;
        this.classServiceService.updateClassService(this.classServiceId, updateRequest).subscribe({
          next: () => {
            this.toastService.show('Operation successfully done!', 'success');
            this.router.navigate(['/class-services']);
          },
          error: (error) => {
            this.toastService.show('Error occurred, Try again later', 'danger');
            console.error('Error updating class/service:', error);
          }
        });
      } else {
        const createRequest: ClassServiceRequest = this.classServiceForm.value;
        this.classServiceService.createClassService(createRequest).subscribe({
          next: () => {
            this.toastService.show('Operation successfully done', 'danger');
            this.router.navigate(['/class-services']);
          },
          error: (error) => {
            this.toastService.show('Error occurred, Try again later', 'danger');
            console.error('Error creating class/service:', error);
          }
        });
      }
    } else {
      Object.keys(this.classServiceForm.controls).forEach(key => {
        const control = this.classServiceForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/class-services']);
  }
}