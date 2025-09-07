import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { ClassServiceService } from "../class-service.service";
import { ClassServiceRequest, ClassServiceResponse, ClassServiceUpdateRequest } from "../class-service";
import { LayoutComponent } from "../../base-component/components/layout/layout.component";
import { NavbarComponent } from "../../base-component/components/navbar/navbar.component";
import { ToastService } from "../../base-component/services/toast/toast.service";
import { Subscription } from 'rxjs';
import {DepartmentService} from "../../department/department.service";
import {ThirdLevelDepartmentService} from "../../department/third-level-department.service";
import {SubDepartmentService} from "../../department/sub-department.service";

@Component({
  selector: 'app-class-service-form',
  standalone: true,
  imports: [
    FormsModule,
    LayoutComponent,
    NavbarComponent,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    NgForOf
  ],
  templateUrl: 'class-service-form.component.html',
  styleUrls: ['class-service-form.component.scss']
})
export class ClassServiceFormComponent implements OnInit, OnDestroy {
  classServiceForm: FormGroup;
  isEditMode = false;
  classServiceId: string | null = null;
  establishmentId: string | null = null;

  // Department data and loading states
  departments: any[] = [];
  subDepartments: any[] = [];
  thirdLevelDepartments: any[] = [];
  isLoadingDepartments = false;
  isLoadingSubDepartments = false;
  isLoadingThirdLevelDepartments = false;

  private subscriptions: Subscription[] = [];

  constructor(
      private fb: FormBuilder,
      private classServiceService: ClassServiceService,
      private departmentService: DepartmentService,
      private subDepartmentService: SubDepartmentService,
      private thirdLevelDepartmentService: ThirdLevelDepartmentService,
      private toastService: ToastService,
      private router: Router,
      private route: ActivatedRoute
  ) {
    this.classServiceForm = this.fb.group({
      nom: ['', Validators.required],
      description: [''],
      establishmentId: ['', Validators.required],
      departmentId: [''],
      subDepartmentId: [''],
      thirdLevelDepartmentId: ['']
    });
  }

  ngOnInit(): void {
    this.classServiceId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.classServiceId;
    this.getEstablishmentIdFromStorage();
    this.loadDepartmentData();
    this.setupDepartmentFieldsLogic();

    if (this.isEditMode && this.classServiceId) {
      this.loadClassServiceData();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadDepartmentData(): void {
    // Load departments
    this.isLoadingDepartments = true;
    const deptSub = this.departmentService.getAllMyDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.isLoadingDepartments = false;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.isLoadingDepartments = false;
      }
    });
    this.subscriptions.push(deptSub);

    // Load sub-departments
    this.isLoadingSubDepartments = true;
    const subDeptSub = this.subDepartmentService.getAllSubDepartmentsByConnectedUser().subscribe({
      next: (subDepartments) => {
        this.subDepartments = subDepartments;
        this.isLoadingSubDepartments = false;
      },
      error: (error) => {
        console.error('Error loading sub-departments:', error);
        this.isLoadingSubDepartments = false;
      }
    });
    this.subscriptions.push(subDeptSub);

    // Load third level departments
    this.isLoadingThirdLevelDepartments = true;
    const thirdLevelSub = this.thirdLevelDepartmentService.getAllThirdLevelDepartmentsByConnectedUser().subscribe({
      next: (thirdLevelDepartments) => {
        this.thirdLevelDepartments = thirdLevelDepartments;
        this.isLoadingThirdLevelDepartments = false;
      },
      error: (error) => {
        console.error('Error loading third level departments:', error);
        this.isLoadingThirdLevelDepartments = false;
      }
    });
    this.subscriptions.push(thirdLevelSub);
  }

  setupDepartmentFieldsLogic(): void {
    // Logic: when one department field is selected, disable the other two
    // When deselected (empty), re-enable the others

    const departmentControl = this.classServiceForm.get('departmentId');
    const subDepartmentControl = this.classServiceForm.get('subDepartmentId');
    const thirdLevelControl = this.classServiceForm.get('thirdLevelDepartmentId');

    // Department field changes
    const deptSub = departmentControl?.valueChanges.subscribe(value => {
      if (value) {
        subDepartmentControl?.disable();
        thirdLevelControl?.disable();
      } else {
        if (!subDepartmentControl?.value && !thirdLevelControl?.value) {
          subDepartmentControl?.enable();
          thirdLevelControl?.enable();
        }
      }
    });
    if (deptSub) this.subscriptions.push(deptSub);

    // Sub-department field changes
    const subDeptSub = subDepartmentControl?.valueChanges.subscribe(value => {
      if (value) {
        departmentControl?.disable();
        thirdLevelControl?.disable();
      } else {
        if (!departmentControl?.value && !thirdLevelControl?.value) {
          departmentControl?.enable();
          thirdLevelControl?.enable();
        }
      }
    });
    if (subDeptSub) this.subscriptions.push(subDeptSub);

    // Third level department field changes
    const thirdLevelSub = thirdLevelControl?.valueChanges.subscribe(value => {
      if (value) {
        departmentControl?.disable();
        subDepartmentControl?.disable();
      } else {
        if (!departmentControl?.value && !subDepartmentControl?.value) {
          departmentControl?.enable();
          subDepartmentControl?.enable();
        }
      }
    });
    if (thirdLevelSub) this.subscriptions.push(thirdLevelSub);
  }

  loadClassServiceData(): void {
    this.classServiceService.getClassServiceById(this.classServiceId!).subscribe({
      next: (classService: ClassServiceResponse) => {
        this.classServiceForm.patchValue({
          nom: classService.nom,
          description: classService.description,
          establishmentId: classService.establishment?.id,
          departmentId: classService.departmentId || '',
          subDepartmentId: classService.subDepartmentId || '',
          thirdLevelDepartmentId: classService.thirdLevelDepartmentId || ''
        });

        // After loading data, apply disable logic based on existing values
        this.applyInitialDisableLogic();
      },
      error: (error) => {
        console.error('Error loading class/service:', error);
      }
    });
  }

  applyInitialDisableLogic(): void {
    // In edit mode, after loading data, disable appropriate fields based on existing values
    const departmentValue = this.classServiceForm.get('departmentId')?.value;
    const subDepartmentValue = this.classServiceForm.get('subDepartmentId')?.value;
    const thirdLevelValue = this.classServiceForm.get('thirdLevelDepartmentId')?.value;

    if (departmentValue) {
      this.classServiceForm.get('subDepartmentId')?.disable();
      this.classServiceForm.get('thirdLevelDepartmentId')?.disable();
    } else if (subDepartmentValue) {
      this.classServiceForm.get('departmentId')?.disable();
      this.classServiceForm.get('thirdLevelDepartmentId')?.disable();
    } else if (thirdLevelValue) {
      this.classServiceForm.get('departmentId')?.disable();
      this.classServiceForm.get('subDepartmentId')?.disable();
    }
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
          this.toastService.error({ message: 'Impossible de lire votre organisation!' });
        }
      } catch (e) {
        this.toastService.error("Impossible de lire votre organisation")
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
      // Get form values including disabled fields for submission
      const formValue = { ...this.classServiceForm.value };

      // Include disabled field values in the payload
      if (this.classServiceForm.get('departmentId')?.disabled) {
        formValue.departmentId = this.classServiceForm.get('departmentId')?.value || '';
      }
      if (this.classServiceForm.get('subDepartmentId')?.disabled) {
        formValue.subDepartmentId = this.classServiceForm.get('subDepartmentId')?.value || '';
      }
      if (this.classServiceForm.get('thirdLevelDepartmentId')?.disabled) {
        formValue.thirdLevelDepartmentId = this.classServiceForm.get('thirdLevelDepartmentId')?.value || '';
      }

      if (this.isEditMode && this.classServiceId) {
        const updateRequest: ClassServiceUpdateRequest = formValue;
        this.classServiceService.updateClassService(this.classServiceId, updateRequest).subscribe({
          next: () => {
            this.toastService.success('Operation reussie!');
            this.router.navigate(['/class-services']);
          },
          error: (error) => {
            this.toastService.error(error.error.message || error.message);
            console.error('Error updating class/service:', error);
          }
        });
      } else {
        const createRequest: ClassServiceRequest = formValue;
        this.classServiceService.createClassService(createRequest).subscribe({
          next: () => {
            this.toastService.success('Operation reussie');
            this.router.navigate(['/class-services']);
          },
          error: (error) => {
            this.toastService.error(error.error.message || error.message);
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