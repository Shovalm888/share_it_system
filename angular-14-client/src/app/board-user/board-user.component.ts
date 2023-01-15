import { StorageService } from './../_services/storage.service';
import {
  actions_metadata_t,
  generic_table_attr,
} from './../generic-table/generic-table.component';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../_services/user.service';
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
  selector: 'app-board-user',
  templateUrl: './board-user.component.html',
  styleUrls: ['./board-user.component.css'],
  animations: [
    trigger('fade', [
      state('false', style({ visibility: AUTO_STYLE, opacity: 0 })),
      state('true', style({ visibility: AUTO_STYLE, opacity: 1 })),
      transition('false => true', animate(1000, style({ opacity: 1 }))),
      transition(
        'true => false',
        animate(DEFAULT_DURATION, style({ opacity: 0 }))
      ),
    ]),
  ],
})
export class BoardUserComponent implements OnInit {
  err_msg?: string;
  entry_info_backup: any = [];
  search_pattern: string = '';
  table_attrs: generic_table_attr = {
    height: 'height: 50rem; !important',
    is_collapsable: true,
    headers: ['#', 'First Name', 'Last Name', 'User Name'],
    card_attrs: [
      'Phone Number',
      'Email',
      'Rank',
      'Roles',
      'Job',
      'Description',
    ],
    entry_info: [],
  };

  isActionSucceed: boolean = false;
  isActionFailed: boolean = false;
  action_msg = '';

  functions?: Array<actions_metadata_t>

  headers2model_attr: any = {
    'First Name': 'fname',
    'Last Name': 'lname',
    'User Name': 'username',
    'Phone Number': 'phone',
    Email: 'email',
    Rank: 'rank',
    Roles: '_roles',
    Job: 'job',
    Description: 'description',
  };

  constructor(
    private userService: UserService,
    private storage_service: StorageService
  ) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.table_attrs.entry_info = JSON.parse(data).users;
        for (let i = 0; i < this.table_attrs.entry_info.length; i++) {
          this.table_attrs.entry_info[i]._roles = '';
          for (
            let j = 0;
            j < this.table_attrs.entry_info[i].roles.length;
            j++
          ) {
            if (j == 0) {
              this.table_attrs.entry_info[
                i
              ]._roles += `${this.table_attrs.entry_info[i].roles[
                j
              ].name.toUpperCase()}`;
            } else {
              this.table_attrs.entry_info[
                i
              ]._roles += `, ${this.table_attrs.entry_info[i].roles[
                j
              ].name.toUpperCase()}`;
            }
          }
          if (this.storage_service.getUser().roles.includes('ADMIN')) {
            this.functions = [{
              icon: "fas fa-trash-alt",
              action: (i: any) => {this.delete_user(i)}
            }];

            for (let i = 0; i < this.table_attrs.entry_info.length; i++) {
              if (this.table_attrs.entry_info[i].is_suspended) {
                this.table_attrs.entry_info[i].function = {
                  icon: 'fa-solid fa-play',
                  action: (i: any) => {
                    this.elevated_user(i);
                  },
                };
              } else {
                this.table_attrs.entry_info[i].function = {
                  icon: 'fa-solid fa-pause',
                  action: (i: any) => {
                    this.suspend_user(i);
                  },
                };
              }
            }
          }
        }

        this.entry_info_backup = this.table_attrs.entry_info;
      },
      error: async (err) => {
        this.parse_error_msg(err);
        await this.display_alert(false);
      },
    });
  }

  suspend_user(i: any) {
    if (
      confirm(
        'Are you sure you want to suspend this user?\nAll its tools are going to be depricated.'
      )
    ) {
      this.userService
        .suspendUser(this.table_attrs.entry_info[i]._id)
        .subscribe({
          next: async (data) => {
            this.action_msg = data.message;

            this.table_attrs.entry_info[i].function = <actions_metadata_t>{
              icon: 'fa-solid fa-play',
              action: (i: any) => {
                this.elevated_user(i);
              },
            };

            this.entry_info_backup = this.table_attrs.entry_info;
            await this.display_alert(true);
          },
          error: async (err) => {
            this.parse_error_msg(err);
            await this.display_alert(false);
          },
        });
    }
  }

  elevated_user(i: any) {
    if (confirm('Are you sure you want to elevate this user?')) {
      this.userService
        .elevatedUser(this.table_attrs.entry_info[i]._id)
        .subscribe({
          next: async (data) => {
            this.action_msg = data.message;

            this.table_attrs.entry_info[i].function = <actions_metadata_t>{
              icon: 'fa-solid fa-pause',
              action: (i: any) => {
                this.suspend_user(i);
              },
            };

            this.entry_info_backup = this.table_attrs.entry_info;
            await this.display_alert(true);
          },
          error: async (err) => {
            this.parse_error_msg(err);
            await this.display_alert(false);
          },
        });
    }
  }

  delete_user(i: any) {
    if (
      confirm(
        'Are you sure you want to DELETE this user?\nAll its related tools are going to lose.'
      )
    ) {
      this.userService
        .deleteUser(this.table_attrs.entry_info[i]._id)
        .subscribe({
          next: async (data) => {
            this.action_msg = data.message;
            let tmp_obj = this.table_attrs.entry_info.splice(i, 1);
            let index = this.table_attrs.entry_info.indexOf(tmp_obj);
            if (index > -1) {
              this.entry_info_backup.splice(index, 1);
            }
            await this.display_alert(true);
          },
          error: async (err) => {
            this.parse_error_msg(err);
            await this.display_alert(false);
          },
        });
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
}
