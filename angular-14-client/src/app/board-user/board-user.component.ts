import { generic_table_attr } from './../generic-table/generic-table.component';
import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-board-user',
  templateUrl: './board-user.component.html',
  styleUrls: ['./board-user.component.css']
})
export class BoardUserComponent implements OnInit {
  err_msg?: string;
  table_attrs: generic_table_attr = {
    is_collapsable: true,
    headers: ["#", "First Name", "Last Name", "User Name"],
    card_attrs: ["Phone Number", "Email", "Rank", "Roles", "Job", "Description"],
    entry_info: []
  };
  headers2model_attr: any = {
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
}
