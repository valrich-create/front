import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {DepartmentService} from "../department.service";
import {SubDepartmentService} from "../sub-department.service";
import {ThirdLevelDepartmentService} from "../third-level-department.service";
import {
    DepartmentRequest,
    DepartmentResponse, SubDepartmentRequest,
    SubDepartmentResponse, ThirdLevelDepartmentRequest,
    ThirdLevelDepartmentResponse
} from "../department-request";
import {LayoutComponent} from "../../base-component/components/layout/layout.component";
import {NavbarComponent} from "../../base-component/components/navbar/navbar.component";

@Component({
    selector: 'app-structure',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, LayoutComponent, NavbarComponent],
    templateUrl: './structure.component.html',
    styleUrls: ['./structure.component.scss']
})
export class StructureComponent implements OnInit {
    pageTitle: string = "Structure";

    // Data
    departments: DepartmentResponse[] = [];
    subDepartments: SubDepartmentResponse[] = [];
    thirdLevelDepartments: ThirdLevelDepartmentResponse[] = [];

    // Selected items
    selectedDepartment: DepartmentResponse | null = null;
    selectedSubDepartment: SubDepartmentResponse | null = null;

    // Popup states
    showDepartmentPopup = false;
    showSubDepartmentPopup = false;
    showThirdLevelPopup = false;
    showDetailsPopup = false;

    // Edit mode
    isEditMode = false;
    editItemId: string = '';

    // Details data
    detailsItem: any = null;
    detailsType: 'department' | 'subDepartment' | 'thirdLevel' = 'department';

    // Forms
    departmentForm!: FormGroup;
    subDepartmentForm!: FormGroup;
    thirdLevelForm!: FormGroup;

    // Column collapse states
    isDepartmentCollapsed = false;
    isSubDepartmentCollapsed = false;
    isThirdLevelCollapsed = false;

    constructor(
        private fb: FormBuilder,
        private departmentService: DepartmentService,
        private subDepartmentService: SubDepartmentService,
        private thirdLevelService: ThirdLevelDepartmentService
    ) {
        this.initForms();
    }

    ngOnInit() {
        this.loadDepartments();
    }

    initForms() {
        this.departmentForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required]
        });

        this.subDepartmentForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            departmentId: ['', Validators.required]
        });

        this.thirdLevelForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            sousDepartmentId: ['', Validators.required]
        });
    }

    // Data loading methods
    loadDepartments() {
        this.departmentService.getAllMyDepartments().subscribe(
            (data) => {
                this.departments = data;
            },
            (error) => {
                console.error('Error loading departments:', error);
            }
        );
    }

    loadSubDepartments(departmentId: string) {
        this.subDepartmentService.getSubDepartmentsByDepartment(departmentId).subscribe(
            (data) => {
                this.subDepartments = data;
            },
            (error) => {
                console.error('Error loading sub-departments:', error);
            }
        );
    }

    loadThirdLevelDepartments(subDepartmentId: string) {
        this.thirdLevelService.getThirdLevelDepartmentsBySubDepartment(subDepartmentId).subscribe(
            (data) => {
                this.thirdLevelDepartments = data;
            },
            (error) => {
                console.error('Error loading third-level departments:', error);
            }
        );
    }

    // Selection methods
    selectDepartment(department: DepartmentResponse) {
        this.selectedDepartment = department;
        this.selectedSubDepartment = null;
        this.thirdLevelDepartments = [];
        this.loadSubDepartments(department.id);
    }

    selectSubDepartment(subDepartment: SubDepartmentResponse) {
        this.selectedSubDepartment = subDepartment;
        this.loadThirdLevelDepartments(subDepartment.id);
    }

    // Details methods
    showDetails(id: string, type: 'department' | 'subDepartment' | 'thirdLevel') {
        this.detailsType = type;

        if (type === 'department') {
            this.departmentService.getDepartmentById(id).subscribe(
                (data) => {
                    this.detailsItem = data;
                    this.showDetailsPopup = true;
                },
                (error) => {
                    console.error('Error loading department details:', error);
                }
            );
        } else if (type === 'subDepartment') {
            this.subDepartmentService.getSubDepartmentById(id).subscribe(
                (data) => {
                    this.detailsItem = data;
                    this.showDetailsPopup = true;
                },
                (error) => {
                    console.error('Error loading sub-department details:', error);
                }
            );
        } else if (type === 'thirdLevel') {
            this.thirdLevelService.getThirdLevelDepartmentById(id).subscribe(
                (data) => {
                    this.detailsItem = data;
                    this.showDetailsPopup = true;
                },
                (error) => {
                    console.error('Error loading third-level details:', error);
                }
            );
        }
    }

    // Edit methods
    editItem(id: string, type: 'department' | 'subDepartment' | 'thirdLevel') {
        this.isEditMode = true;
        this.editItemId = id;

        if (type === 'department') {
            this.departmentService.getDepartmentById(id).subscribe(
                (data) => {
                    this.departmentForm.patchValue({
                        title: data.title,
                        description: data.description
                    });
                    this.showDepartmentPopup = true;
                },
                (error) => {
                    console.error('Error loading department for edit:', error);
                }
            );
        } else if (type === 'subDepartment') {
            this.subDepartmentService.getSubDepartmentById(id).subscribe(
                (data) => {
                    this.subDepartmentForm.patchValue({
                        title: data.title,
                        description: data.description,
                        departmentId: data.departmentId
                    });
                    this.showSubDepartmentPopup = true;
                },
                (error) => {
                    console.error('Error loading sub-department for edit:', error);
                }
            );
        } else if (type === 'thirdLevel') {
            this.thirdLevelService.getThirdLevelDepartmentById(id).subscribe(
                (data) => {
                    this.thirdLevelForm.patchValue({
                        title: data.title,
                        description: data.description,
                        sousDepartmentId: data.subDepartmentId
                    });
                    this.showThirdLevelPopup = true;
                },
                (error) => {
                    console.error('Error loading third-level for edit:', error);
                }
            );
        }
    }

    // Popup methods
    openDepartmentPopup() {
        this.isEditMode = false;
        this.editItemId = '';
        this.showDepartmentPopup = true;
        this.departmentForm.reset();
    }

    openSubDepartmentPopup() {
        if (!this.selectedDepartment) {
            alert('Veuillez d\'abord sélectionner un département');
            return;
        }
        this.isEditMode = false;
        this.editItemId = '';
        this.showSubDepartmentPopup = true;
        this.subDepartmentForm.reset();
        this.subDepartmentForm.patchValue({ departmentId: this.selectedDepartment.id });
    }

    openThirdLevelPopup() {
        if (!this.selectedSubDepartment) {
            alert('Veuillez d\'abord sélectionner un sous-département');
            return;
        }
        this.isEditMode = false;
        this.editItemId = '';
        this.showThirdLevelPopup = true;
        this.thirdLevelForm.reset();
        this.thirdLevelForm.patchValue({ sousDepartmentId: this.selectedSubDepartment.id });
    }

    closePopups() {
        this.showDepartmentPopup = false;
        this.showSubDepartmentPopup = false;
        this.showThirdLevelPopup = false;
        this.showDetailsPopup = false;
        this.isEditMode = false;
        this.editItemId = '';
        this.detailsItem = null;
    }

    // Creation and update methods
    createDepartment() {
        if (this.departmentForm.valid) {
            const request: DepartmentRequest = this.departmentForm.value;

            if (this.isEditMode) {
                this.departmentService.updateDepartment(this.editItemId, request).subscribe(
                    (response) => {
                        const index = this.departments.findIndex(d => d.id === this.editItemId);
                        if (index !== -1) {
                            this.departments[index] = response;
                        }
                        this.closePopups();
                    },
                    (error) => {
                        console.error('Error updating department:', error);
                    }
                );
            } else {
                this.departmentService.createDepartment(request).subscribe(
                    (response) => {
                        this.departments.push(response);
                        this.closePopups();
                    },
                    (error) => {
                        console.error('Error creating department:', error);
                    }
                );
            }
        }
    }

    createSubDepartment() {
        if (this.subDepartmentForm.valid) {
            const request: SubDepartmentRequest = this.subDepartmentForm.value;

            if (this.isEditMode) {
                this.subDepartmentService.updateSubDepartment(this.editItemId, request).subscribe(
                    (response) => {
                        const index = this.subDepartments.findIndex(sd => sd.id === this.editItemId);
                        if (index !== -1) {
                            this.subDepartments[index] = response;
                        }
                        this.closePopups();
                    },
                    (error) => {
                        console.error('Error updating sub-department:', error);
                    }
                );
            } else {
                this.subDepartmentService.createSubDepartment(request).subscribe(
                    (response) => {
                        this.subDepartments.push(response);
                        this.closePopups();
                    },
                    (error) => {
                        console.error('Error creating sub-department:', error);
                    }
                );
            }
        }
    }

    createThirdLevel() {
        if (this.thirdLevelForm.valid) {
            const request: ThirdLevelDepartmentRequest = this.thirdLevelForm.value;

            if (this.isEditMode) {
                this.thirdLevelService.updateThirdLevelDepartment(this.editItemId, request).subscribe(
                    (response) => {
                        const index = this.thirdLevelDepartments.findIndex(tl => tl.id === this.editItemId);
                        if (index !== -1) {
                            this.thirdLevelDepartments[index] = response;
                        }
                        this.closePopups();
                    },
                    (error) => {
                        console.error('Error updating third-level department:', error);
                    }
                );
            } else {
                this.thirdLevelService.createThirdLevelDepartment(request).subscribe(
                    (response) => {
                        this.thirdLevelDepartments.push(response);
                        this.closePopups();
                    },
                    (error) => {
                        console.error('Error creating third-level department:', error);
                    }
                );
            }
        }
    }

    // Delete methods
    deleteDepartment(id: string) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
            this.departmentService.deleteDepartment(id).subscribe(
                () => {
                    this.departments = this.departments.filter(d => d.id !== id);
                    if (this.selectedDepartment?.id === id) {
                        this.selectedDepartment = null;
                        this.subDepartments = [];
                        this.thirdLevelDepartments = [];
                    }
                },
                (error) => {
                    console.error('Error deleting department:', error);
                }
            );
        }
    }

    deleteSubDepartment(id: string) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce sous-département ?')) {
            this.subDepartmentService.deleteSubDepartment(id).subscribe(
                () => {
                    this.subDepartments = this.subDepartments.filter(sd => sd.id !== id);
                    if (this.selectedSubDepartment?.id === id) {
                        this.selectedSubDepartment = null;
                        this.thirdLevelDepartments = [];
                    }
                },
                (error) => {
                    console.error('Error deleting sub-department:', error);
                }
            );
        }
    }

    deleteThirdLevel(id: string) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce troisième niveau ?')) {
            this.thirdLevelService.deleteThirdLevelDepartment(id).subscribe(
                () => {
                    this.thirdLevelDepartments = this.thirdLevelDepartments.filter(tl => tl.id !== id);
                },
                (error) => {
                    console.error('Error deleting third-level department:', error);
                }
            );
        }
    }

    // Column toggle methods
    toggleDepartmentColumn() {
        this.isDepartmentCollapsed = !this.isDepartmentCollapsed;
    }

    toggleSubDepartmentColumn() {
        this.isSubDepartmentCollapsed = !this.isSubDepartmentCollapsed;
    }

    toggleThirdLevelColumn() {
        this.isThirdLevelCollapsed = !this.isThirdLevelCollapsed;
    }
}