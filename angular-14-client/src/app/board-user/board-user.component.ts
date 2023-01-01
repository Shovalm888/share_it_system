import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../_services/user.service';
import {
  AUTO_STYLE,
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';

const DEFAULT_DURATION = 300;

@Component({
  selector: 'app-board-user',
  templateUrl: './board-user.component.html',
  styleUrls: ['./board-user.component.css'],
  animations: [
    trigger('collapse', [
      state('false', style({ height: AUTO_STYLE, visibility: AUTO_STYLE })),
      state('true', style({ height: '0', visibility: 'hidden' })),
      transition('false => true', animate(DEFAULT_DURATION + 'ms ease-in')),
      transition('true => false', animate(DEFAULT_DURATION + 'ms ease-out'))
    ])
  ]
})
export class BoardUserComponent implements OnInit {
  err_msg?: string;
  table_attrs: any = {
    headers: ["#", "First Name", "Last Name", "User Name"],
    card_attrs: ["Phone Number", "Email", "Rank", "Roles", "Job", "Description"],
    entry_info: []
  };
  model_attr2headers: any = {
    "First Name": "fname",
    "Last Name": "lname",
    "User Name": "username",
    "Phone Number": "phone",
    "Email": "email",
    "Rank": "rank",
    "Roles": "_roles",
    "Job": "job",
    "Decription": "description",
  }

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    
    this.userService.getAllUsers().subscribe({
      next: data => {
        this.table_attrs.entry_info = JSON.parse(data).users;
        for(let i = 0; i < this.table_attrs.entry_info.length; i ++ ){
          this.table_attrs.entry_info[i]._roles = "";
          for(let j = 0; j < this.table_attrs.entry_info[i].roles.length; j++){
            if( j == 0){
              this.table_attrs.entry_info[i]._roles += `${this.table_attrs.entry_info[i].roles[j].name.toUpperCase()}`;
            } else {
              this.table_attrs.entry_info[i]._roles += `, ${this.table_attrs.entry_info[i].roles[j].name.toUpperCase()}`;
            }
            
          }
        }

        this.capitalize_all_entries();
      },
      error: err => {
        if (err.error) {
          try {
            const res = JSON.parse(err.error);
            this.err_msg = res.message;
          } catch {
            this.err_msg = `Error with status: ${err.status} - ${err.statusText}`;
          }
        } else {
          this.err_msg = `Error with status: ${err.status}`;
        }
      }
    });
  }

  collapse(i: any) {
    this.table_attrs.entry_info[i].show = false;
  }

  expand(i: any) {
    this.table_attrs.entry_info[i].show = true;
  }

  capitalize_all_entries() {
    for(let i = 0; i < this.table_attrs.entry_info.length; i++){
      for (const [key, value] of Object.entries(this.table_attrs.entry_info[i])) {
        if (typeof value === 'string' && value.length > 0){
          this.table_attrs.entry_info[i][key] = value[0].toUpperCase() + value.slice(1);
        }
      }
    }
  }
}
