import { Component, OnInit } from '@angular/core';
import {
  AUTO_STYLE,
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { StorageService } from '../_services/storage.service';
import { ToolService } from '../_services/tool.service';

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
displayStyle = "none";
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
  form: any = {
    name: null,
    manufacturing_date: null,
    status: null,
    max_time_borrow: null,
    categories: null,
    producer: null,
    description: null,
  };

  isSuccessful = false;
  isAddingToolFailed = false;
  errorMessage = '';
  successMessage = '';

  constructor(private storageService: StorageService, private toolService: ToolService) { }

  ngOnInit(): void {
    
    this.load_tools();

    
  }

  load_tools(){
    this.toolService.getAllTools().subscribe({
      next: data => {
        this.table_attrs.entry_info = JSON.parse(data).tools;
        for(let i = 0; i < this.table_attrs.entry_info.length; i++){
          this.table_attrs.entry_info[i].owner = this.table_attrs.entry_info[i].owner.username;
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

  onSubmit(): void {
    const { name, manufacturing_date, status, max_time_borrow, categories, producer, description } = this.form;
    const user_id = this.storageService.getUser().id;

    this.toolService.addTool(name, manufacturing_date, status, max_time_borrow, categories, producer, user_id, description).subscribe({
      next: data => {
            this.successMessage = data.message;
            this.isSuccessful = true;
            this.isAddingToolFailed = false;
            this.errorMessage = '';
            this.closePopup();
            this.load_tools();
          },
          error: err => {
            this.errorMessage = err.error.message;
            this.isAddingToolFailed = true;
            this.successMessage = '';
            this.isSuccessful = false;
          }
    });
  }

  collapse(i: any) {
    this.table_attrs.entry_info[i].show = false;
  }

  expand(i: any) {
    this.table_attrs.entry_info[i].show = true;
  }

  borrow(i: any) {
    
  }
  
  openPopup() {
    this.displayStyle = "block";
  }
  closePopup() {
    this.displayStyle = "none";
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
