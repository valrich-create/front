import {Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import {EventService} from "../events.service";
import {ToastService} from "../../base-component/services/toast/toast.service";

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: "event-form.component.html",
  styleUrls: ["event-form.component.scss"]
})

export class EventFormComponent implements OnInit {
  informationForm!: FormGroup;
  descriptionLength: number = 0;
  establishmentId: string | null = null;
  selectedFiles: File[] = [];
  maxFiles: number = 5;
  maxFileSize: number = 10 * 1024 * 1024; // 10MB
  allowedFileTypes: string[] = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/msword', // doc
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-excel', // xls
    'text/plain'
  ];

  constructor(
      private fb: FormBuilder,
      private router: Router,
      private eventService: EventService,
      private toastService: ToastService,
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
          this.toastService.error("Impossible de lire votre organisation")
          console.warn('No establishment ID found in user data');
        }
      } catch (e) {
        this.toastService.error("Impossible de lire votre organisation")
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

  onFileSelect(event: any): void {
    const files: FileList = event.target.files;

    if (files && files.length > 0) {
      // Vérifier le nombre total de fichiers
      if (this.selectedFiles.length + files.length > this.maxFiles) {
        alert(`Vous ne pouvez sélectionner que ${this.maxFiles} fichiers maximum.`);
        return;
      }

      // Ajouter les nouveaux fichiers
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Vérifier le type de fichier
        if (!this.allowedFileTypes.includes(file.type)) {
          alert(`Le type de fichier "${file.name}" n'est pas autorisé.`);
          continue;
        }

        // Vérifier la taille du fichier
        if (file.size > this.maxFileSize) {
          alert(`Le fichier "${file.name}" dépasse la taille maximale autorisée (10MB).`);
          continue;
        }

        this.selectedFiles.push(file);
      }
    }

    // Réinitialiser l'input pour permettre la sélection du même fichier
    event.target.value = '';
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  getFileIcon(file: File): string {
    if (file.type.startsWith('image/')) {
      return '🖼️';
    } else if (file.type === 'application/pdf') {
      return '📄';
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return '📝';
    } else if (file.type.includes('sheet') || file.type.includes('excel')) {
      return '📊';
    } else {
      return '📎';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onSubmit(): void {
    if (this.informationForm.valid) {
      const formValue = this.informationForm.value;

      // Créer FormData pour envoyer les fichiers
      const formData = new FormData();

      // Ajouter les données du formulaire
      formData.append('title', formValue.title);
      formData.append('description', formValue.description);
      formData.append('isImportant', formValue.isImportant.toString());
      formData.append('establishmentId', formValue.establishmentId);

      // Format dates if isImportant is true
      if (formValue.isImportant) {
        formData.append('importanceDisplayStartDate', new Date(formValue.importanceDisplayStartDate).toISOString());
        formData.append('importanceDisplayEndDate', new Date(formValue.importanceDisplayEndDate).toISOString());
      }

      // Ajouter les fichiers
      this.selectedFiles.forEach((file, index) => {
        formData.append(`files`, file, file.name);
      });

      this.eventService.createInformation(formData).subscribe({
        next: (response) => {
          this.toastService.success(response.message);
          this.router.navigate(['/informations']);
        },
        error: (error) => {
          this.toastService.error(error.error.message || error.message);
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