import { ToolService } from './../_services/tool.service';
import { UserService } from './../_services/user.service';
import { Component, OnInit } from '@angular/core';
import { StorageService } from '../_services/storage.service';
import { generic_table_attr } from '../generic-table/generic-table.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  current_user?: any;
  err_msg?: string;
  table_attrs: generic_table_attr = {
    height: 'height: 500px !important;',
    is_collapsable: true,
    headers: ['#', 'Tool Name', 'Manufacturing Date', 'Status'],
    card_attrs: [
      'Max Borrow Time',
      'Categories',
      'Producer',
      'Owner',
      'Description',
    ],
    entry_info: [],
  };

  headers2model_attr: any = {
    'Tool Name': 'name',
    'Manufacturing Date': 'manufacturing_date',
    Status: 'status',
    'Max Borrow Time': 'max_time_borrow',
    Categories: 'categories',
    Producer: 'producer',
    Owner: 'owner',
    Decription: 'description',
  };

  user_properties: { [key: string]: string } = {
    'Full name': 'full_name',
    'Email': 'email',
    'Phone': 'phone',
    'Tools amount': 'tools_amount',
    'Rank': 'rank'
  }

  constructor(private storageService: StorageService, private user_service: UserService, private tool_service: ToolService) { }

  ngOnInit(): void {
    this.user_service.getUser().subscribe({
      next: data => {
        this.current_user = data.user;
        this.current_user.tools_amount = 0;
        this.current_user.full_name = `${this.capitalize_strings(this.current_user.fname)} ${this.capitalize_strings(this.current_user.lname)}` 
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
    })

    this.tool_service.getMyTools().subscribe({
      next: (data) => {
        this.table_attrs.entry_info = data.tools;
        for (let i = 0; i < this.table_attrs.entry_info.length; i++) {
          this.table_attrs.entry_info[i].link_name = 'Tool page';
          this.table_attrs.entry_info[i].owner =
            this.table_attrs.entry_info[i].owner.username;
        }
      },
      error: (err) => {
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
      },
    });
  }

  capitalize_strings(str: string): string{
    return str.slice(0,1).toUpperCase() + str.slice(1);
  }
}
