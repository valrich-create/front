import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";

interface Student {
  name: string;
  class: string;
  avatar: string;
}

@Component({
  selector: 'app-recent-students',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-students.component.html',
  styleUrls: ['./recent-students.component.scss']
})
export class RecentStudentsComponent implements OnInit {
  studentCount = 456;
  students: Student[] = [
    { name: 'Samantha William', class: 'VII A', avatar: 'assets/avatars/avatar1.jpg' },
    { name: 'Tony Soap', class: 'VII A', avatar: 'assets/avatars/avatar2.jpg' },
    { name: 'Karen Hope', class: 'VII A', avatar: 'assets/avatars/avatar3.jpg' },
    { name: 'Jordan Nico', class: 'VII A', avatar: 'assets/avatars/avatar4.jpg' },
    { name: 'Nadia Adja', class: 'VII B', avatar: 'assets/avatars/avatar5.jpg' }
  ];

  constructor() { }

  ngOnInit(): void { }
}
