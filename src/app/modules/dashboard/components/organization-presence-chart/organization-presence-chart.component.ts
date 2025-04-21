import {Component, OnInit} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import {CommonModule} from "@angular/common";

Chart.register(...registerables);

@Component({
  selector: 'app-organization-presence-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './organization-presence-chart.component.html',
  styleUrls: ['./organization-presence-chart.component.scss']
})
export class OrganizationPresenceChartComponent implements OnInit {
  chart: any;
  weekStats = {
    thisWeek: '1.245',
    lastWeek: '1.356'
  };
  incomePercentage = 42;

  constructor() { }

  ngOnInit(): void {
    this.createChart();
  }

  createChart() {
    setTimeout(() => {
      const ctx = document.getElementById('organizationPresenceChart') as HTMLCanvasElement;
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Presence',
            data: [95, 59, 35, 81, 56, 55, 42],
            backgroundColor: [
              '#ffb84d', '#ff7a59', '#5e4dcd', '#ffb84d',
              '#ff7a59', '#5e4dcd', '#ffb84d'
            ],
            borderRadius: 6
          }]
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
              max: 100
            }
          }
        }
      });
    }, 100);
  }
}
