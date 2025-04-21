import {Component, OnInit} from '@angular/core';
import {StatisticsCardsComponent} from "../components/statistics-cards/statistics-cards.component";
import { SchoolPerformanceChartComponent } from "../components/school-performance-chart/school-performance-chart.component";
import {OrganizationCalendarComponent} from "../components/organization-calendar/organization-calendar.component";
import { OrganizationPresenceChartComponent } from "../components/organization-presence-chart/organization-presence-chart.component";
import { RecentAdministrationActivityComponent } from "../components/recent-administration-activity/recent-administration-activity.component";
import {RecentStudentsComponent} from "../components/recent-students/recent-students.component";
import {DashboardMessagesComponent} from "../components/dashboard-messages/dashboard-messages.component";
import {DashboardServicesComponent} from "../components/dashboard-services/dashboard-services.component";
import {CommonModule} from "@angular/common";
import {SidebarComponent} from "../../base-component/components/sidebar/sidebar.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StatisticsCardsComponent,
    SchoolPerformanceChartComponent,
    OrganizationCalendarComponent,
    OrganizationPresenceChartComponent,
    RecentAdministrationActivityComponent,
    RecentStudentsComponent,
    DashboardMessagesComponent,
    DashboardServicesComponent,
    SidebarComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser = {
    name: 'Nabila A.',
    role: 'Admin'
  };

  constructor() { }

  ngOnInit(): void { }
}
