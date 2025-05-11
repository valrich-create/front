import {Component, Input} from '@angular/core';
import { Chart } from 'chart.js';
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-class-presence-balance',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './class-presence-balance.component.html',
  styleUrls: ['./class-presence-balance.component.scss']
})
export class ClassPresenceBalanceComponent {
  @Input() presencesCount: number = 0;
  @Input() absencesCount: number = 0;

  selectedFilter = 'Month';
  filters = ['Day', 'Week', 'Month', 'Year'];
  presenceChart: any;

  ngAfterViewInit(): void {
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
}
