import { Component, OnInit } from '@angular/core';
import { StatisticsCardsComponent } from "../components/statistics-cards/statistics-cards.component";
import { SchoolPerformanceChartComponent } from "../components/school-performance-chart/school-performance-chart.component";
import { OrganizationCalendarComponent } from "../components/organization-calendar/organization-calendar.component";
import { OrganizationPresenceChartComponent } from "../components/organization-presence-chart/organization-presence-chart.component";
import { RecentAdministrationActivityComponent } from "../components/recent-administration-activity/recent-administration-activity.component";
import { RecentStudentsComponent } from "../components/recent-students/recent-students.component";
import { DashboardMessagesComponent } from "../components/dashboard-messages/dashboard-messages.component";
import { CommonModule } from "@angular/common";
import { LayoutComponent } from "../../base-component/components/layout/layout.component";
import { NavbarComponent } from "../../base-component/components/navbar/navbar.component";
import {
  DailyGlobalStatsResponse,
  Establishment,
  UserMetricsResponse,
  YearlyPresenceStatsResponse
} from "../../organizations/organization";
import { OrganizationService } from "../../organizations/organization.service";
import { EventService } from "../../events/events.service";
import { ActivatedRoute } from "@angular/router";
import { ToastService } from "../../base-component/services/toast/toast.service";
import {UserService} from "../../users/services/user.service";

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
  currentEstablishment?: Establishment;

  currentYear: number = new Date().getFullYear();
  previousYear = this.currentYear - 1;

  userMetrics?: UserMetricsResponse;
  dailyStats?: DailyGlobalStatsResponse;
  yearlyStats?: YearlyPresenceStatsResponse;

  isLoading: boolean = true;

  constructor(
      private route: ActivatedRoute,
      private organizationService: OrganizationService,
      private userService: UserService,
      private toast: ToastService,
      private eventService: EventService
  ) { }

  async ngOnInit(): Promise<void> {
    try {
      await this.loadUserData();
      await this.loadEstablishmentData();

      if (this.currentEstablishment) {
        await this.loadOrganizationDashboard();
      } else {
        this.toast.warning("Aucune donnée trouvée pour votre compte.");
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
      this.toast.error("Une erreur est survenue lors du chargement.");
    } finally {
      this.isLoading = false;
    }
  }

  async retryLoading(): Promise<void> {
    this.isLoading = true;
    try {
      await this.loadEstablishmentData();
      if (this.currentEstablishment) {
        await this.loadOrganizationDashboard();
      }
    } catch (error) {
      console.error("Retry failed:", error);
      this.toast.error("Échec du rechargement");
    } finally {
      this.isLoading = false;
    }
  }

  private async loadUserData(): Promise<void> {
    const storage = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
    if (!storage) throw new Error('No user data found');

    const userData = JSON.parse(storage);
    this.userFullName = `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim();
    this.userEmail = userData.email ?? '';
    this.userPhone = userData.phoneNumber ?? '';
    this.userRole = userData.role ?? '';
  }

  private async loadEstablishmentData(): Promise<void> {
    try {
      // 1. Essayer depuis l'URL
      const routeId = this.route.snapshot.paramMap.get('id');
      if (routeId) {
        this.currentEstablishment = await this.organizationService
            .getEstablishmentById(routeId)
            .toPromise();
        return;
      }

      // 2. Essayer depuis le storage
      const storage = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
      const userData = JSON.parse(storage || '{}');

      if (userData.establishment?.id) {
        this.currentEstablishment = await this.organizationService
            .getEstablishmentById(userData.establishment.id)
            .toPromise();
      }

      // 3. Avertir si aucune Organisation trouvé
      if (!this.currentEstablishment) {
        this.toast.warning(
            "Impossible de déterminer votre établissement. \nCertaines fonctionnalités organisationnelles ne seront pas disponibles."
        );
      }
    } catch (error) {
      console.warn("Establishment loading warning:", error);
      this.toast.warning(
          "Erreur lors du chargement de votre organisation. Certaines fonctionnalités pourraient être limitées."
      );
    }
  }

  private async loadOrganizationDashboard(): Promise<void> {
    try {
      const [metrics, dailyStats, yearlyStats] = await Promise.all([
        this.organizationService.getUserMetrics(this.establishmentId).toPromise(),
        this.organizationService.getDailyGlobalStats(this.establishmentId).toPromise(),
        this.organizationService.getYearlyPresenceStats(this.establishmentId, this.currentYear).toPromise()
      ]);

      this.userMetrics = metrics;
      this.dailyStats = dailyStats;
      this.yearlyStats = yearlyStats;

      this.toast.success("Dashboard organisation chargé");
    } catch (error) {
      console.error("Organization dashboard error:", error);
      throw error;
    }
  }

  get establishmentId(): string {
    return this.currentEstablishment?.id || '';
  }

  get establishmentName(): string {
    return this.currentEstablishment?.nom || '';
  }
}
