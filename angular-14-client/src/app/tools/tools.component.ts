import { Component, OnInit } from '@angular/core';
import { StorageService } from '../_services/storage.service';
import { ToolService } from '../_services/tool.service';
import { Router } from '@angular/router';
import { VariableBinding } from '@angular/compiler';
import { actions_metadata_t, generic_table_attr } from '../generic-table/generic-table.component';
import {
  animate,
  AUTO_STYLE,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

const DEFAULT_DURATION = 3000;

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css'],
  animations: [
    trigger('fade', [
      state('false', style({ visibility: AUTO_STYLE, opacity: 0 })),
      state('true', style({ visibility: AUTO_STYLE, opacity: 1 })),
      transition('false => true', animate(1000, style({ opacity: 1 }))),
      transition(
        'true => false',
        animate(DEFAULT_DURATION, style({ opacity: 0 }))
      ),
    ])
  ]
})
export class ToolsComponent implements OnInit {
  functions: Array<actions_metadata_t> = [{
    icon: "fa-solid fa-link",
    action: (i: any) => {this.go_to(i)}
  }];

  current_year = new Date().getFullYear();
  err_msg?: string;
  displayStyle = 'none';
  entry_info_backup = [];
  search_pattern: string = '';
  table_attrs: generic_table_attr = {
    height: 'height: 50rem; !important',
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
    Description: 'description',
  };
  form: any = {
    name: null,
    manufacturing_date: null,
    max_time_borrow: null,
    categories: null,
    producer: null,
    description: null,
  };

  action_msg?: string;
  isActionSucceed: boolean = false;
  isActionFailed: boolean = false;

  constructor(
    private storageService: StorageService,
    private toolService: ToolService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load_tools();
  }

  load_tools() {
    this.toolService.getAllTools().subscribe({
      next: (data) => {
        this.table_attrs.entry_info = JSON.parse(data).tools;
        for (let i = 0; i < this.table_attrs.entry_info.length; i++) {
          this.table_attrs.entry_info[i].owner =
            this.table_attrs.entry_info[i].owner.username;
        }
        this.entry_info_backup = this.table_attrs.entry_info;
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

  go_to(i: any){
    this.router.navigate(['/tools/board-tool/' , this.table_attrs.entry_info[i]._id]);
  }

  onSubmit(): void {
    const {
      name,
      manufacturing_date,
      max_time_borrow,
      categories,
      producer,
      description,
    } = this.form;
    const user_id = this.storageService.getUser().id;


    this.toolService
      .addTool(
        name,
        manufacturing_date,
        'available',
        max_time_borrow,
        categories,
        producer,
        user_id,
        description
      )
      .subscribe({
        next: async (data) => {
          this.action_msg = data.message;
          this.closePopup();
          this.load_tools();
          this.form = {}
          await this.display_alert(true);
        },
        error: async (err) => {
          this.parse_error_msg(err);
          await this.display_alert(false);
        },
      });
  }

  openPopup() {
    this.displayStyle = 'block';
  }
  closePopup() {
    this.displayStyle = 'none';
  }

  search_regex(){
    if (this.search_pattern) {
      this.table_attrs.entry_info = [];
      let search_pattern = this.search_pattern.replace(",", " ");
      search_pattern = search_pattern.replace("  ", " ");
      search_pattern = search_pattern.toLocaleLowerCase();
      let words = this.search_pattern.split(" ");
      
      for (let i = 0; i < words.length; i++){
        words[i] = "(" + words[i] + ")"
      }

      let pattern_ = words.join("|");
      const pat = new RegExp(pattern_);
      for (let i = 0; i < this.entry_info_backup.length; i++){
        if (JSON.stringify(this.entry_info_backup[i]).replace(/['",:\[\]\{\}_ ]/g, "").toLowerCase().search(pat) !== -1){
          this.table_attrs.entry_info.push(this.entry_info_backup[i])
        }
      }
    }
    else {
      this.table_attrs.entry_info = this.entry_info_backup;
    }
  }

  delay(sec: number) {
    return new Promise((resolve) => setTimeout(resolve, sec * 1000));
  }

  async display_alert(is_sucess: boolean) {
    if (is_sucess) {
      this.isActionFailed = false;
      this.isActionSucceed = true;
      await this.delay(3);
      this.isActionSucceed = false;
    } else {
      this.isActionFailed = true;
      this.isActionSucceed = false;
      await this.delay(3);
      this.isActionFailed = false;
    }
    await this.delay(3);
    this.action_msg = '';
  }

  parse_error_msg(err: any) {
    let message = '';

    if (err.error) {
      try {
        if(typeof err.error === "string"){
          message = JSON.parse(err.error).message;
        }
        else {
          message = err.error.message;
        }
      } catch {
        message = err.statusText;
      }
    }
    
    this.action_msg = `Error with status: ${err.status} - ${message}`;
  }

}
