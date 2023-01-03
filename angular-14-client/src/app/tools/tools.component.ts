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
import { Router } from '@angular/router';
import { VariableBinding } from '@angular/compiler';

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
})// form err msg!!!!!!!!!!!!!!
export class ToolsComponent implements OnInit {
form_err_msg: string = "";
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

  constructor(private storageService: StorageService, private toolService: ToolService, private router: Router) { }

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

  
  
  // validationnnnnnn!!!!!!!!!!!!!!
  validateYear(manufacturing_date: number): boolean {
    this.form_err_msg = '';
    const min_year = 1800;
    const current_year = new Date().getFullYear();

    if (manufacturing_date < min_year || manufacturing_date > current_year){
      this.form_err_msg += `Year must be between ${min_year} to ${current_year}`
    }

    return this.form_err_msg.length == 0;
  }
  


  onSubmit(): void {
    const { name, manufacturing_date, status, max_time_borrow, categories, producer, description } = this.form;
    const user_id = this.storageService.getUser().id;
    if (!this.validateYear(manufacturing_date)){
      return;
    }

    const _status = status.toLowerCase();

    this.toolService.addTool(name, manufacturing_date, _status, max_time_borrow, categories, producer, user_id, description).subscribe({
      next: data => {
            this.successMessage = data.message;
            this.isSuccessful = true;
            this.isAddingToolFailed = false;
            this.errorMessage = '';
            this.closePopup();
            this.load_tools();
            // Map all form's attrs to null
          },
          error: err => {
            this.errorMessage = ('message' in err) ?  err.message: err.error.message;
            this.isAddingToolFailed = true;
            this.successMessage = '';
            this.isSuccessful = false;
          }
    });
  }
 
  



  
  

  go_to_tool(i: any) {
    let tool_id = this.table_attrs.entry_info[i]._id;

    this.router.navigate(["/board-tool/:id"], {queryParams: {id: tool_id}});
    
    
    // const path = "/tools/tool_id/" + this.table_attrs.entry_info[i]._id
    // return path;
  }

  collapse(i: any) {
    this.table_attrs.entry_info[i].show = false;
  }

  expand(i: any) {
    this.table_attrs.entry_info[i].show = true;
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
        if (typeof value === 'string' && key != "description"){
          this.table_attrs.entry_info[i][key] = value[0].toUpperCase() + value.slice(1);
        }
      }
    }
  }
}
function validateYear(manufacturing_date: any, number: any) {
  throw new Error('Function not implemented.');
}

