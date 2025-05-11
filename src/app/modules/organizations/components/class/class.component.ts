import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronRight, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import {Chart} from "chart.js";
import {PaginationComponent} from "../pagination/pagination.component";

@Component({
  selector: 'app-class',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, PaginationComponent],
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.scss']
})
export class ClassComponent  implements OnInit {
  @Input() className: string = 'Classe A';

  // Icons
  faEllipsisV = faEllipsisV;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;

  // Stats data
  totalUsers = 932;
  totalChiefs = 754;
  presenceRate = 86;

  // Filter options
  selectedFilter = 'Month';
  filters = ['Day', 'Week', 'Month', 'Year'];

  // Presence balance data
  presencesCount = 1245;
  absencesCount = 1356;

  // Chart
  presenceChart: any;

  // Users data
  users = [
    { name: 'Samantha W.', id: '123456789', class: 'VII A', presenceRate: 85, status: 'Complete', timestamp: '2 March 2021, 13:45 PM' },
    { name: 'Tony Soap', id: '123456789', class: 'VII A', presenceRate: 70, status: 'Pending', timestamp: '2 March 2021, 13:45 PM' },
    { name: 'Jordan Nico', id: '123456789', class: 'VII A', presenceRate: 45, status: 'Canceled', timestamp: '2 March 2021, 13:45 PM' },
    { name: 'Karen Hope', id: '123456789', class: 'VII A', presenceRate: 92, status: 'Complete', timestamp: '2 March 2021, 13:45 PM' },
    { name: 'Nadila Adja', id: '123456789', class: 'VII A', presenceRate: 88, status: 'Complete', timestamp: '2 March 2021, 13:45 PM' }
  ];

  // Top presence users
  topPresenceUsers = [
    { id: '123456789', presenceRate: 95, absenceRate: 5, status: 'Complete', timestamp: '2 March 2021, 13:45 PM' },
    { id: '123456789', presenceRate: 80, absenceRate: 20, status: 'Pending', timestamp: '2 March 2021, 13:45 PM' },
    { id: '123456789', presenceRate: 65, absenceRate: 35, status: 'Canceled', timestamp: '2 March 2021, 13:45 PM' },
    { id: '123456789', presenceRate: 92, absenceRate: 8, status: 'Complete', timestamp: '2 March 2021, 13:45 PM' },
    { id: '123456789', presenceRate: 88, absenceRate: 12, status: 'Complete', timestamp: '2 March 2021, 13:45 PM' }
  ];

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 100;

  constructor() {}

  ngOnInit(): void {
    this.initPresenceChart();
  }

  initPresenceChart(): void {
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const chartElement = document.getElementById('presenceBalanceChart') as HTMLCanvasElement;
    if (chartElement) {
      this.presenceChart = new Chart(chartElement, {
        type: 'line',
        data: {
          labels: this.selectedFilter === 'Day' ? dayLabels : monthLabels,
          datasets: [
            {
              label: 'Presences',
              data: [25, 40, 60, 75, 65, 35, 45, 65, 45, 25, 65, 70],
              borderColor: '#FFC107',
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Absences',
              data: [15, 30, 40, 50, 40, 25, 55, 40, 35, 30, 55, 45],
              borderColor: '#FF7A59',
              backgroundColor: 'rgba(255, 122, 89, 0.1)',
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          }
        }
      });
    }
  }

  updateChartFilter(filter: string): void {
    this.selectedFilter = filter;

    if (this.presenceChart) {
      const labels = this.selectedFilter === 'Day'
          ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      this.presenceChart.data.labels = labels;
      this.presenceChart.update();
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    // Here you would fetch new data for the current event-form
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Complete':
        return 'status-complete';
      case 'Pending':
        return 'status-pending';
      case 'Canceled':
        return 'status-canceled';
      default:
        return '';
    }
  }
}