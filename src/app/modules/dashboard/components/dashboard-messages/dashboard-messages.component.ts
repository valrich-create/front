import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";

interface Message {
  sender: string;
  avatar: string;
  content: string;
  time: string;
}

@Component({
  selector: 'app-dashboard-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-messages.component.html',
  styleUrls: ['./dashboard-messages.component.scss']
})
export class DashboardMessagesComponent implements OnInit {
  messages: Message[] = [
    {
      sender: 'Samantha William',
      avatar: 'assets/avatars/avatar1.jpg',
      content: 'Lorem ipsum dolor sit amet...',
      time: '12:45 PM'
    },
    {
      sender: 'Tony Soap',
      avatar: 'assets/avatars/avatar2.jpg',
      content: 'Lorem ipsum dolor sit amet...',
      time: '12:45 PM'
    },
    {
      sender: 'Jordan Nico',
      avatar: 'assets/avatars/avatar3.jpg',
      content: 'Lorem ipsum dolor sit amet...',
      time: '12:45 PM'
    },
    {
      sender: 'Nadia Adja',
      avatar: 'assets/avatars/avatar5.jpg',
      content: 'Lorem ipsum dolor sit amet...',
      time: '12:45 PM'
    }
  ];

  constructor() { }

  ngOnInit(): void { }
}
