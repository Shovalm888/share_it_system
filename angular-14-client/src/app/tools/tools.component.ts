import { Component, OnInit } from '@angular/core';
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
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css'],
  animations: [
    trigger('collapse', [
      state('false', style({ height: AUTO_STYLE, visibility: AUTO_STYLE })),
      state('true', style({ height: '0', visibility: 'hidden' })),
      transition('false => true', animate(DEFAULT_DURATION + 'ms ease-in')),
      transition('true => false', animate(DEFAULT_DURATION + 'ms ease-out'))
    ])
  ]
})
export class ToolsComponent implements OnInit {
err_msg?: string;
  table_attrs: any = {
    headers: ["#", "Tool Name", "Manufacturing Date", "Status"],
    card_attrs: ["Max Borrow Time", "Categories", "Producer", "Owner", "Description"],
    entry_info: []
  };
  model_attr2headers: any = {
    "Tool Name": "name",
    "Manufacturing Date": "manufacturing_date",
    "Status": "status",
    "Max Borrow Time": "max_time_borrow",
    "Categories": "categories",
    "Producer": "producer",
    "Owner": "owner",
    "Decription": "description",
  }

  constructor() { }

  ngOnInit(): void {
    this.table_attrs.entry_info = [
      {
        name: "electric drill",
        manufacturing_date: "12/06/1995",
        status: "available",
        max_time_borrow: "5",
        categories: "electronics, Work",
        producer: "makita",
        owner: "smoshe",
        description: "good shape",
      }
    ]
    this.capitalize_all_entries();
  }

  collapse(i: any) {
    this.table_attrs.entry_info[i].show = false;
  }

  expand(i: any) {
    this.table_attrs.entry_info[i].show = true;
  }

  borrow(i: any) {
    
  }

  capitalize_all_entries() {
    for(let i = 0; i < this.table_attrs.entry_info.length; i++){
      for (const [key, value] of Object.entries(this.table_attrs.entry_info[i])) {
        if (typeof value === 'string'){
          this.table_attrs.entry_info[i][key] = value[0].toUpperCase() + value.slice(1);
        }
      }
    }
  }
}
