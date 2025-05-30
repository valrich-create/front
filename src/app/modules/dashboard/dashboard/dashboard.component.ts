import {Component, OnInit} from '@angular/core';
import {StatisticsCardsComponent} from "../components/statistics-cards/statistics-cards.component";
import { SchoolPerformanceChartComponent } from "../components/school-performance-chart/school-performance-chart.component";
import {OrganizationCalendarComponent} from "../components/organization-calendar/organization-calendar.component";
import { OrganizationPresenceChartComponent } from "../components/organization-presence-chart/organization-presence-chart.component";
import { RecentAdministrationActivityComponent } from "../components/recent-administration-activity/recent-administration-activity.component";
import {RecentStudentsComponent} from "../components/recent-students/recent-students.component";
import {DashboardMessagesComponent} from "../components/dashboard-messages/dashboard-messages.component";
import {CommonModule} from "@angular/common";
import {LayoutComponent} from "../../base-component/components/layout/layout.component";
import {NavbarComponent} from "../../base-component/components/navbar/navbar.component";
import {
  DailyGlobalStatsResponse,
  UserMetricsResponse,
  YearlyPresenceStatsResponse
} from "../../organizations/organization";
import {OrganizationService} from "../../organizations/organization.service";
import {EventService} from "../../events/events.service";

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
    LayoutComponent,
    NavbarComponent
  ],
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userFullName: string = '';
  userEmail: string = '';
  userPhone: string = '';
  userRole: string = '';
  currentEstablishmentId: string = '';
  establishmentName: string = 'Dashboard';


  currentYear: number = new Date().getFullYear();
  previousYear = this.currentYear - 1;

  // Données pour les composants enfants
  userMetrics?: UserMetricsResponse;
  dailyStats?: DailyGlobalStatsResponse;
  yearlyStats?: YearlyPresenceStatsResponse;


  constructor(
      private organizationService: OrganizationService,
      private eventService: EventService
  ) { }

  ngOnInit(): void {
    this.loadUserAndEstablishmentData();
  }

  private loadUserAndEstablishmentData(): void {
    const storage = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
    if (!storage) {
      console.warn('Aucune donnée utilisateur trouvée.');
      return;
    }

    try {
      const userData = JSON.parse(storage);

      // Données utilisateur
      this.userFullName = `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim();
      this.userEmail = userData.email ?? '';
      this.userPhone = userData.phoneNumber ?? '';
      this.userRole = userData.role ?? '';

      // Données établissement (imbriquées dans userData)
      const establishment = userData.establishment;
      if (establishment) {
        this.currentEstablishmentId = establishment.id ?? '';
        this.establishmentName = establishment.nom ?? 'Dashboard';

        // Charger les données spécifiques du tableau de bord
        if (this.currentEstablishmentId) {
          this.loadDashboardData();
        }
      } else {
        console.warn('Aucun établissement trouvé dans les données utilisateur.');
      }

    } catch (error) {
      console.error('Erreur lors de la lecture des données utilisateur:', error);
    }
  }

  // private loadUserAndEstablishmentData(): void {
  //   const userData = JSON.parse(localStorage.getItem('user_data') || "");
  //   const establishmentData = JSON.parse(localStorage.getItem('currentEstablishment') || "");
  //
  //   this.currentEstablishmentId = establishmentData.id || '';
  //   this.establishmentName = establishmentData.name || 'Dashboard';
  //
  //   if (this.currentEstablishmentId) {
  //     this.loadDashboardData();
  //   }
  // }

  private loadDashboardData(): void {
    // Chargement des métriques utilisateurs
    this.organizationService.getUserMetrics(this.currentEstablishmentId)
        .subscribe({
          next: metrics => this.userMetrics = metrics,
          error: err => console.error('Failed to load user metrics', err)
        });

    // Chargement des stats quotidiennes
    this.organizationService.getDailyGlobalStats(this.currentEstablishmentId)
        .subscribe(stats => this.dailyStats = stats);

    // Chargement des stats annuelles
    this.organizationService.getYearlyPresenceStats(this.currentEstablishmentId, this.currentYear)
        .subscribe(stats => this.yearlyStats = stats);
  }
}
