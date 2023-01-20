import { Component, OnInit } from '@angular/core';
import { AdminService } from '../_services/admin.service';
import { UserService } from '../_services/user.service';
import {
  animate,
  AUTO_STYLE,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { generic_table_attr } from '../generic-table/generic-table.component';

const DEFAULT_DURATION = 3000;

@Component({
  selector: 'app-board-admin',
  templateUrl: './board-admin.component.html',
  styleUrls: ['./board-admin.component.css'],
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
export class BoardAdminComponent implements OnInit {
  organization_form: any = {
    organization_code: null,
  };

  system_info: any = {

  }

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

  action_msg?: string;
  isActionSucceed: boolean = false;
  isActionFailed: boolean = false;

  constructor(
    private userService: UserService,
    private adminService: AdminService
  ) {}

  /**
   * The function is called when the component is initialized. It calls the getAdminBoard() function in
   * the userService.ts file. The function returns an observable. The observable is subscribed to and
   * the next and error functions are defined. The next function sets the content variable to the data
   * returned by the observable. The error function sets the content variable to the error message
   */
  ngOnInit(): void {

  }

  /**
   * The function is called when the user clicks the submit button on the form.
   * The function then calls the adminService.setOrganizationCode() function, which is defined in the
   * admin.service.ts file.
   */
  onSetOrganizationCode(): void {
    const organization_code = this.organization_form.organization_code;

    this.adminService.setOrganizationCode(organization_code).subscribe({
      next: async (data) => {
        this.action_msg = data.message
        await this.display_alert(true);
      },
      error: async (err) => {
        this.parse_error_msg(err);
        await this.display_alert(false);
      },
    });
  }

    /**
   * It returns a promise that resolves after a given number of seconds.
   * @param {number} sec - number - The number of seconds to wait before resolving the promise.
   * @returns A promise that will resolve after the specified number of seconds.
   */
    delay(sec: number) {
      return new Promise((resolve) => setTimeout(resolve, sec * 1000));
    }
  
    /**
     * If the action is successful, set the success flag to true and the failure flag to false, then wait
     * 3 seconds, then set the success flag to false. If the action is not successful, set the failure
     * flag to true and the success flag to false, then wait 3 seconds, then set the failure flag to
     * false. Then wait 3 seconds, then set the action message to an empty string.
     * @param {boolean} is_sucess - boolean - this is a boolean value that determines whether the action
     * was successful or not.
     */
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
  
    /**
     * If the error is a string, parse it as JSON and get the message property. If it's not a string,
     * just get the message property. If it's neither, get the statusText property.
     * </code>
     * @param {any} err - any - the error object
     */
    parse_error_msg(err: any) {
      let message = '';
  
      if (err.error) {
        try {
          if (typeof err.error === 'string') {
            message = JSON.parse(err.error).message;
          } else {
            message = err.error.message;
          }
        } catch {
          message = err.statusText;
        }
      }
  
      this.action_msg = `Error with status: ${err.status} - ${message}`;
    }
}
