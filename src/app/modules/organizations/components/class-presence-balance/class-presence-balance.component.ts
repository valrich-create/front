import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import { Chart } from 'chart.js';
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";

export interface PresenceStatsData {
  labels: string[];
  presencePercentages: number[];
  absencePercentages: number[];
  totalPresences: number;
  totalAbsences: number;
}

export interface FilterOption {
  value: 'today' | 'week' | 'year';
  label: string;
}

@Component({
  selector: 'app-class-presence-balance',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './class-presence-balance.component.html',
  styleUrls: ['./class-presence-balance.component.scss']
})
export class ClassPresenceBalanceComponent implements OnChanges, AfterViewInit {
  @Input() selectedFilter: 'today' | 'week' | 'year' = 'today';
  @Input() filterOptions: FilterOption[] = [
    {value: 'today', label: 'Day'},
    {value: 'week', label: 'Week'},
    {value: 'year', label: 'Month'}
  ];

  @Input() hourlyData?: PresenceStatsData;
  @Input() dailyData?: PresenceStatsData;
  @Input() monthlyData?: PresenceStatsData;

  @Output() selectedFilterChange = new EventEmitter<'today' | 'week' | 'year'>();

  presenceChart: any;

  get currentData(): PresenceStatsData | null {
    switch(this.selectedFilter) {
      case 'today': return this.hourlyData || null;
      case 'week': return this.dailyData || null;
      case 'year': return this.monthlyData || null;
      default: return this.hourlyData || null;
    }
  }

  get presencesCount(): number {
    return this.currentData?.totalPresences || 0;
  }

  get absencesCount(): number {
    return this.currentData?.totalAbsences || 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['hourlyData'] || changes['dailyData'] || changes['monthlyData'] || changes['selectedFilter'])
        && this.presenceChart) {
      this.updateChartData();
    }
  }

  ngAfterViewInit(): void {
    this.initPresenceChart();
    if (this.currentData) {
      this.updateChartData();
    }
  }

  initPresenceChart(): void {
    const chartElement = document.getElementById('presenceBalanceChart') as HTMLCanvasElement;
    if (chartElement) {
      this.presenceChart = new Chart(chartElement, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Presences',
              data: [],
              borderColor: '#49ff07',
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Absences',
              data: [],
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
              intersect: false,
              callbacks: {
                label: (context) => {
                  return `${context.dataset.label}: ${context.raw}%`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: (value) => `${value}%`
              }
            }
          }
        }
      });
    }
  }

  updateChartData(): void {
    if (this.presenceChart && this.currentData) {
      this.presenceChart.data.labels = this.currentData.labels;
      this.presenceChart.data.datasets[0].data = this.currentData.presencePercentages;
      this.presenceChart.data.datasets[1].data = this.currentData.absencePercentages;
      this.presenceChart.update();
    }
  }

  updateChartFilter(filter: 'today' | 'week' | 'year'): void {
    this.selectedFilterChange.emit(filter);
    // this.selectedFilter = filter;
    // this.selectedFilterChange.emit(filter);
    this.updateChartData();
  }

}
