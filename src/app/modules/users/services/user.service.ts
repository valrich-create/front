import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from "rxjs";
import {SortOption, User} from "../users.models";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {} // Injection correcte

  // private http = inject(HttpClient);
  private apiUrl = '/users'; // URL à ajuster selon votre backend

  // Pour la démonstration, nous utiliserons des données mockées
  private mockUsers: User[] = [
    {
      id: 'STU001',
      name: 'Samanta William',
      email: 'samanta.william@email.com',
      phone: '+33612345678',
      profilePicture: 'assets/avatars/avatar1.png',
      age: 16,
      class: 'VII A',
      parentName: 'Maria William',
      city: 'Jakarta',
      country: 'Indonesia',
      function: 'Délégué',
      organization: 'Akademi Historia',
      dateCreated: new Date('2021-03-25'),
      bio: 'Passionate about history and literature. Class delegate for 2 years.',
      education: [
        {
          degree: 'Secondary Education',
          institution: 'Jakarta International School',
          yearFrom: 2018,
          yearTo: 2023
        }
      ],
      expertise: ['History', 'Literature', 'Debate'],
      attendanceRecords: [],
      checkInLocations: []
    },
    {
      id: 'STU002',
      name: 'Tony Soap',
      email: 'tony.soap@email.com',
      phone: '+33623456789',
      profilePicture: 'assets/avatars/avatar2.png',
      age: 17,
      class: 'VII B',
      parentName: 'James Soap',
      city: 'Jakarta',
      country: 'Indonesia',
      function: 'Utilisateur',
      organization: 'Akademi Historia',
      dateCreated: new Date('2021-03-25'),
      bio: 'Science enthusiast with focus on physics and mathematics.',
      education: [
        {
          degree: 'Secondary Education',
          institution: 'Jakarta Science High School',
          yearFrom: 2017,
          yearTo: 2022
        }
      ],
      expertise: ['Physics', 'Mathematics', 'Robotics'],
      attendanceRecords: [],
      checkInLocations: []
    },
    {
      id: 'STU003',
      name: 'Karen Hope',
      email: 'karen.hope@email.com',
      phone: '+33634567890',
      profilePicture: 'assets/avatars/avatar3.png',
      age: 18,
      class: 'VII C',
      parentName: 'Justin Hope',
      city: 'Jakarta',
      country: 'Indonesia',
      function: 'Délégué adjoint',
      organization: 'Akademi Historia',
      dateCreated: new Date('2021-03-25'),
      bio: 'Art and design specialist. Vice-delegate helping with class organization.',
      education: [
        {
          degree: 'Secondary Education',
          institution: 'Jakarta Arts Academy',
          yearFrom: 2016,
          yearTo: 2021
        }
      ],
      expertise: ['Painting', 'Graphic Design', 'Photography'],
      attendanceRecords: [],
      checkInLocations: []
    },
    {
      id: 'STU004',
      name: 'Jordan Nico',
      email: 'jordan.nico@email.com',
      phone: '+33645678901',
      profilePicture: 'assets/avatars/avatar4.png',
      age: 15,
      class: 'VII A',
      parentName: 'Amanda Nico',
      city: 'Jakarta',
      country: 'Indonesia',
      function: 'Utilisateur',
      organization: 'Akademi Historia',
      dateCreated: new Date('2021-03-25'),
      bio: 'Youngest in class but excelling in computer science.',
      education: [
        {
          degree: 'Secondary Education',
          institution: 'Jakarta Tech School',
          yearFrom: 2019,
          yearTo: 2024
        }
      ],
      expertise: ['Programming', 'Web Development', 'AI'],
      attendanceRecords: [],
      checkInLocations: []
    },
    {
      id: 'STU005',
      name: 'Nadila Adja',
      email: 'nadila.adja@email.com',
      phone: '+33656789012',
      profilePicture: 'assets/avatars/avatar5.png',
      age: 16,
      class: 'VII B',
      parentName: 'Jack Adja',
      city: 'Jakarta',
      country: 'Indonesia',
      function: 'Délégué',
      organization: 'Akademi Historia',
      dateCreated: new Date('2021-03-25'),
      bio: 'Sports captain and class delegate. Specializes in biology.',
      education: [
        {
          degree: 'Secondary Education',
          institution: 'Jakarta Sports Academy',
          yearFrom: 2018,
          yearTo: 2023
        }
      ],
      expertise: ['Biology', 'Athletics', 'Leadership'],
      attendanceRecords: [],
      checkInLocations: []
    },
    {
      id: 'STU006',
      name: 'Johnny Ahmad',
      email: 'johnny.ahmad@email.com',
      phone: '+33667890123',
      profilePicture: 'assets/avatars/avatar6.png',
      age: 16,
      class: 'VII C',
      parentName: 'Danny Ahmad',
      city: 'Jakarta',
      country: 'Indonesia',
      function: 'Délégué',
      organization: 'Akademi Historia',
      dateCreated: new Date('2021-03-25'),
      bio: 'Music prodigy and class representative. Plays 3 instruments.',
      education: [
        {
          degree: 'Secondary Education',
          institution: 'Jakarta Music College',
          yearFrom: 2018,
          yearTo: 2023
        }
      ],
      expertise: ['Music', 'Piano', 'Composition'],
      attendanceRecords: [],
      checkInLocations: []
    }
  ];

  private selectedUsersSubject = new BehaviorSubject<string[]>([]);
  selectedUsers$ = this.selectedUsersSubject.asObservable();

  getUsers(searchTerm: string = '', sortBy: SortOption = 'newest'): Observable<User[]> {
    // Dans un environnement réel, nous utiliserions le service HTTP
    // return this.http.get<User[]>(this.apiUrl);

    // Mais pour la démonstration, nous filtrons et trions nos données mockées
    let filteredUsers = this.mockUsers;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
          user.name.toLowerCase().includes(term) ||
          user.id.toLowerCase().includes(term) ||
          user.city.toLowerCase().includes(term) ||
          user.class.toLowerCase().includes(term)
      );
    }

    // Tri des utilisateurs
    return of(this.sortUsers(filteredUsers, sortBy));
  }

  getUserById(id: string): Observable<User | undefined> {
    // Dans un environnement réel, nous utiliserions le service HTTP
    // return this.http.get<User>(`${this.apiUrl}/${id}`);

    // Mais pour la démonstration, nous trouvons l'utilisateur dans nos données mockées
    const user = this.mockUsers.find(u => u.id === id);
    return of(user);
  }

  // getUserById(id: string): Observable<User> {
  //   return this.http.get<User>(`/api/users/${id}`);
  // }

  toggleUserSelection(userId: string): void {
    const currentSelection = this.selectedUsersSubject.value;
    if (currentSelection.includes(userId)) {
      this.selectedUsersSubject.next(currentSelection.filter(id => id !== userId));
    } else {
      this.selectedUsersSubject.next([...currentSelection, userId]);
    }
  }

  clearSelection(): void {
    this.selectedUsersSubject.next([]);
  }

  deleteUser(id: string): Observable<boolean> {
    // Logique de suppression
    return of(true);
  }

  private sortUsers(users: User[], sortBy: SortOption): User[] {
    return [...users].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
        case 'oldest':
          return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
        case 'age':
          return a.age - b.age;
        case 'class':
          return a.class.localeCompare(b.class);
        default:
          return 0;
      }
    });
  }

  // constructor() { }
}
