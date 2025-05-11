// event.service.ts
import { Injectable } from '@angular/core';
import {Events} from "./events";

@Injectable({
  providedIn: 'root'
})
export class EventService {
  // Exemple de données d'événements
  private events: Events[] = [
    {
      id: 1,
      title: 'Basic Algorithm',
      category: 'Algorithm',
      startTime: new Date(2021, 2, 20, 9, 0), // 20 Mars 2021, 9:00
      endTime: new Date(2021, 2, 20, 10, 0),  // 20 Mars 2021, 10:00
      color: '#FFD700', // Gold
      attendees: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ]
    },
    {
      id: 2,
      title: 'Basic Art',
      category: 'Art',
      startTime: new Date(2021, 2, 20, 9, 0),
      endTime: new Date(2021, 2, 20, 10, 0),
      color: '#FF6347', // Tomato
      attendees: [
        { id: 3, name: 'Claire' }
      ]
    },
    {
      id: 3,
      title: 'HTML & CSS Class',
      category: 'Programming',
      startTime: new Date(2021, 2, 20, 9, 0),
      endTime: new Date(2021, 2, 20, 10, 0),
      color: '#4169E1', // Royal Blue
      attendees: [
        { id: 4, name: 'David' },
        { id: 5, name: 'Emily' },
        { id: 6, name: 'Frank' }
      ]
    },
    {
      id: 4,
      title: 'Simple Past Tense',
      category: 'English',
      startTime: new Date(2021, 2, 20, 9, 0),
      endTime: new Date(2021, 2, 20, 10, 0),
      color: '#32CD32', // Lime Green
      attendees: [
        { id: 7, name: 'George' }
      ]
    },
    {
      id: 5,
      title: 'Project Meeting',
      category: 'Work',
      startTime: new Date(2021, 0, 2, 14, 0), // 2 Janvier 2021, 14:00
      endTime: new Date(2021, 0, 2, 15, 30),  // 2 Janvier 2021, 15:30
      color: '#FF4500', // Orange Red
      attendees: [
        { id: 1, name: 'Alice' },
        { id: 3, name: 'Claire' }
      ]
    },
    {
      id: 6,
      title: 'Team Lunch',
      category: 'Social',
      startTime: new Date(2021, 0, 10, 12, 0), // 10 Janvier 2021, 12:00
      endTime: new Date(2021, 0, 10, 13, 30),  // 10 Janvier 2021, 13:30
      color: '#9370DB', // Medium Purple
      attendees: [
        { id: 2, name: 'Bob' },
        { id: 4, name: 'David' },
        { id: 5, name: 'Emily' }
      ]
    },
    {
      id: 7,
      title: 'Code Review',
      category: 'Programming',
      startTime: new Date(2021, 0, 15, 10, 0), // 15 Janvier 2021, 10:00
      endTime: new Date(2021, 0, 15, 11, 0),   // 15 Janvier 2021, 11:00
      color: '#20B2AA', // Light Sea Green
      attendees: [
        { id: 1, name: 'Alice' },
        { id: 6, name: 'Frank' }]
    },
    {
      id: 8,
      title: 'Design Meeting',
      category: 'Design',
      startTime: new Date(2021, 0, 18, 15, 0), // 18 Janvier 2021, 15:00
      endTime: new Date(2021, 0, 18, 16, 0),   // 18 Janvier 2021, 16:00
      color: '#FF69B4', // Hot Pink
      attendees: [
        { id: 3, name: 'Claire' },
        { id: 7, name: 'Tony' }
      ]
    },
    {
      id: 9,
      title: 'JavaScript Workshop',
      category: 'Programming',
      startTime: new Date(2021, 0, 24, 9, 0),  // 24 Janvier 2021, 9:00
      endTime: new Date(2021, 0, 24, 12, 0),   // 24 Janvier 2021, 12:00
      color: '#4169E1', // Royal Blue
      attendees: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 4, name: 'David' }
      ]
    },
    {
      id: 10,
      title: 'Angular Training',
      category: 'Programming',
      startTime: new Date(2021, 0, 29, 13, 0), // 29 Janvier 2021, 13:00
      endTime: new Date(2021, 0, 29, 17, 0),   // 29 Janvier 2021, 17:00
      color: '#FF4500', // Orange Red
      attendees: [
        { id: 5, name: 'Emily' },
        { id: 6, name: 'Frank' },
        { id: 7, name: 'Johnny' }
      ]
    }
  ];

  constructor() {}

  /**
   * Récupère tous les événements
   */
  getAllEvents(): Events[] {
    return [...this.events];
  }

  /**
   * Récupère les événements pour un jour spécifique
   */
  getEventsForDay(date: Date): Events[] {
    return this.events.filter(event => {
      return this.isSameDay(event.startTime, date);
    });
  }

  /**
   * Récupère les événements pour un mois spécifique
   */
  getEventsForMonth(year: number, month: number): Events[] {
    return this.events.filter(event => {
      return event.startTime.getFullYear() === year &&
          event.startTime.getMonth() === month;
    });
  }

  /**
   * Ajoute un nouvel événement
   */
  addEvent(event: Events): void {
    // Simuler une génération d'ID (en pratique, le backend s'en chargerait)
    const newId = Math.max(...this.events.map(e => e.id)) + 1;
    this.events.push({...event, id: newId});
  }

  /**
   * Met à jour un événement existant
   */
  updateEvent(updatedEvent: Events): void {
    const index = this.events.findIndex(e => e.id === updatedEvent.id);
    if (index !== -1) {
      this.events[index] = {...updatedEvent};
    }
  }

  /**
   * Supprime un événement
   */
  deleteEvent(id: number): void {
    this.events = this.events.filter(e => e.id !== id);
  }

  /**
   * Vérifie si deux dates correspondent au même jour
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
  }

  /**
   * Génère une couleur aléatoire pour un nouvel événement
   */
  generateRandomColor(): string {
    const colors = [
      '#FF6347', // Tomato
      '#4169E1', // Royal Blue
      '#32CD32', // Lime Green
      '#FFD700', // Gold
      '#9370DB', // Medium Purple
      '#20B2AA', // Light Sea Green
      '#FF69B4', // Hot Pink
      '#FF4500'  // Orange Red
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}