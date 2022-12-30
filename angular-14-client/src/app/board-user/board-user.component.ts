import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../_services/user.service';


@Component({
  selector: 'app-board-user',
  templateUrl: './board-user.component.html',
  styleUrls: ['./board-user.component.css']
})
export class BoardUserComponent implements OnInit {
  content?: string;
  table_attrs: any = {
    headers: null,
    card_attrs: null,
    entry_info: null
  };
  model_attr2headers = {
    "fname": "First Name",
    "lname": "Last Name",
    "username": "User Name",
    "phone": "Phone Number",
    "email": "Email",
    "rank": "Rank",
    "job": "Job",
    "description": "Decription"
  }

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    
    this.table_attrs.headers = ["#", "First", "Last", "Username"];
    this.table_attrs.card_attrs = ["Phone", "Email", "Rank", "Job", "Description"];
    this.table_attrs.entry_info = [
      {
        "fname": "Shoval", 
        "lname": "Moshe", 
        "username": "smoshe", 
        "phone": "0544767814",
        "email": "smoshe@nvidia.com",
        "rank": "1",
        "job": "",
        "description": "Stub"
      }
    ];
    this.userService.getUserBoard().subscribe({
      next: data => {
        this.content = data;
      },
      error: err => {
        if (err.error) {
          try {
            const res = JSON.parse(err.error);
            this.content = res.message;
          } catch {
            this.content = `Error with status: ${err.status} - ${err.statusText}`;
          }
        } else {
          this.content = `Error with status: ${err.status}`;
        }
      }
    });
  }
}
