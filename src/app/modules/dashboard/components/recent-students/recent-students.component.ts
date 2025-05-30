import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import {TopUserPresenceResponse} from "../../../organizations/organization";
import {OrganizationService} from "../../../organizations/organization.service";

@Component({
  selector: 'app-recent-students',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-students.component.html',
  styleUrls: ['./recent-students.component.scss']
})

export class RecentStudentsComponent implements OnInit {
  @Input() establishmentId!: string;
  topStudents: TopUserPresenceResponse[] = [];

  constructor(private organizationService: OrganizationService) { }

  ngOnInit(): void {
    if (this.establishmentId) {
      this.loadTopStudents();
    }
  }

  loadTopStudents(): void {
    this.organizationService.getTopPresentUsers(this.establishmentId)
        .subscribe({
          next: (students) => {
            this.topStudents = students.slice(0, 5); // Prendre les 5 premiers
          },
          error: (err) => {
            console.error('Failed to load top students:', err);
          }
        });
  }

  getPositionColor(index: number): string {
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#5e4dcd', '#5e4dcd'];
    return colors[index] || '#5e4dcd';
  }
}








// import {Component, OnInit} from '@angular/core';
// import {CommonModule} from "@angular/common";
//
// interface Student {
//   name: string;
//   class: string;
//   avatar: string;
// }
//
// @Component({
//   selector: 'app-recent-students',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './recent-students.component.html',
//   styleUrls: ['./recent-students.component.scss']
// })
// export class RecentStudentsComponent implements OnInit {
//   studentCount = 456;
//   students: Student[] = [
//     { name: 'Samantha William', class: 'VII A', avatar: 'assets/avatars/avatar1.jpg' },
//     { name: 'Tony Soap', class: 'VII A', avatar: 'assets/avatars/avatar2.jpg' },
//     { name: 'Karen Hope', class: 'VII A', avatar: 'assets/avatars/avatar3.jpg' },
//     { name: 'Jordan Nico', class: 'VII A', avatar: 'assets/avatars/avatar4.jpg' },
//     { name: 'Nadia Adja', class: 'VII B', avatar: 'assets/avatars/avatar5.jpg' }
//   ];
//
//   constructor() { }
//
//   ngOnInit(): void { }
// }
