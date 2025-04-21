import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";

interface Service {
  name: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-dashboard-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-services.component.html',
  styleUrls: ['./dashboard-services.component.scss']
})
export class DashboardServicesComponent implements OnInit {
  services: Service[] = [
    {
      name: 'Beef Steak with Fried Potato',
      description: 'Lorem ipsum dolor sit amet...',
      image: 'assets/services/food1.jpg'
    },
    {
      name: 'Pancake with Honey',
      description: 'Lorem ipsum dolor sit amet...',
      image: 'assets/services/food2.jpg'
    },
    {
      name: 'Japanese Beef Ramen',
      description: 'Lorem ipsum dolor sit amet...',
      image: 'assets/services/food3.jpg'
    }
  ];

  constructor() { }

  ngOnInit(): void { }
}
