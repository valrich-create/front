import { Component, Input } from '@angular/core';
import { UserResponse } from "../../users.models";

@Component({
  selector: 'app-user-profile-header',
  standalone: true,
  template: `
    <div class="profile-card">
      <div class="profile-header">
        <div class="circle-decoration"></div>
        <div class="circle-decoration-2"></div>
      </div>
      <div class="profile-avatar">
        <span class="initials">{{getInitials(user?.firstName + ' ' + user?.lastName)}}</span>
      </div>

      <div class="profile-content">
        <h2 class="profile-name">{{user?.firstName}} {{user?.lastName}}</h2>
        <div class="profile-title">{{user?.role || 'No role specified'}}</div>

        <div class="profile-info">
          <div class="profile-info-item" *ngIf="user?.phoneNumber">
            <div class="profile-info-icon icon-phone">
              <i class="fas fa-phone"></i>
            </div>
            <span>{{user?.phoneNumber}}</span>
          </div>

          <div class="profile-info-item" *ngIf="user?.email">
            <div class="profile-info-icon icon-email">
              <i class="fas fa-envelope"></i>
            </div>
            <span>{{user?.email}}</span>
          </div>
        </div>

<!--        <div class="about-section" *ngIf="user?.bio">-->
<!--          <h3 class="section-title">About:</h3>-->
<!--          <p>{{user?.bio}}</p>-->
<!--        </div>-->

        <div class="education-section" *ngIf="user?.establishmentName?.length">
          <h3 class="section-title">Education:</h3>
          <ul class="list-unstyled">
            <li class="education-item" *ngFor="let edu of user?.establishmentName">
              <div><i class="fas fa-circle-dot me-2"></i>{{edu.degree}}, {{edu.institution}}</div>
              <div class="education-year">{{edu.yearFrom}} - {{edu.yearTo}}</div>
            </li>
          </ul>
        </div>

        <div class="expertise-section" *ngIf="user?.classeServiceNom?.length">
          <h3 class="section-title">Expertise:</h3>
          <div class="expertise-tags">
            <span *ngFor="let skill of user?.classeManagerNom">{{skill}}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class UserProfileHeaderComponent {
  @Input() user: UserResponse | null = null;

  getInitials(name?: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}