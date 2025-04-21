import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import {CommonModule, isPlatformBrowser} from "@angular/common";

Chart.register(...registerables);

@Component({
  selector: 'app-school-performance-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './school-performance-chart.component.html',
  styleUrls: ['./school-performance-chart.component.scss']
})
export class SchoolPerformanceChartComponent implements OnInit {
  chart: any;
  weekStats = {
    thisWeek: '1.245',
    lastWeek: '1.356'
  };

  // constructor() { }

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.createChart();
    }
  }

  createChart() {
    setTimeout(() => {
      const ctx = document.getElementById('schoolPerformanceChart') as HTMLCanvasElement;
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'This Year',
              data: [20, 75, 38, 10, 30, 55, 25, 60, 25, 74, 50, 40],
              borderColor: '#ffb84d',
              backgroundColor: 'rgba(255, 184, 77, 0.2)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Last Year',
              data: [12, 45, 65, 30, 20, 35, 60, 45, 20, 65, 45, 25],
              borderColor: '#ff7a59',
              backgroundColor: 'rgba(255, 122, 89, 0.2)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                stepSize: 25
              }
            }
          }
        }
      });
    }, 100);
  }
}
