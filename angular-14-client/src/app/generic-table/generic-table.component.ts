import { Component, Input, OnInit } from '@angular/core';
import {
  AUTO_STYLE,
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';

const DEFAULT_DURATION = 300;

export interface actions_metadata_t{
  icon: string,
  action: any
}

export interface generic_table_attr{
  height?: string,
  headers: any,
  card_attrs: any,
  entry_info: any,
  is_collapsable: boolean
}

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.css'],
  animations: [
    trigger('collapse', [
      state('false', style({ height: AUTO_STYLE, visibility: AUTO_STYLE })),
      state('true', style({ height: '0', visibility: 'hidden' })),
      transition('false => true', animate(DEFAULT_DURATION + 'ms ease-in')),
      transition('true => false', animate(DEFAULT_DURATION + 'ms ease-out'))
    ])
  ]
})
export class GenericTableComponent implements OnInit {

  @Input() table_attrs: generic_table_attr={} as generic_table_attr;
  @Input() functions?: Array<actions_metadata_t>; 
  @Input() err_msg?: string;
  @Input() headers2model_attr: any;

  constructor() { }

  ngOnInit(): void {
    this.capitalize_all_entries();
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
