import {
  animate,
  AUTO_STYLE,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../_services/storage.service';
import { ToolService } from '../_services/tool.service';
import { map, shareReplay } from 'rxjs/operators';
import { interval, Observable } from 'rxjs';
import { splitNsName } from '@angular/compiler';

const DEFAULT_DURATION = 3000;
@Component({
  selector: 'app-board-tool',
  templateUrl: './board-tool.component.html',
  styleUrls: ['./board-tool.component.css'],
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
    trigger('collapse', [
      state('false', style({ height: AUTO_STYLE, visibility: AUTO_STYLE })),
      state('true', style({ height: '0', visibility: 'hidden' })),
      transition('false => true', animate(300 + 'ms ease-in')),
      transition('true => false', animate(300 + 'ms ease-out')),
    ]),
  ],
})
export class BoardToolComponent implements OnInit {
  today = this.local_date_to_str(new Date());
  current_year = new Date().getFullYear();
  suspended_user: boolean = false;
  action_msg?: string;
  isBorrowRequestFailed: boolean = false;
  isActionSucceed: boolean = false;
  isActionFailed: boolean = false;
  err_msg?: string;
  tool_id: string = '';
  tool_info: any = {};
  private sub: any;
  requests: any = {
    open: [],
    closed: [],
    all: [],
    appreved: null,
    my: null,
    headers: ['#', 'Requestor', 'Expiration date', 'Phone', 'Email'],
    card_attrs: ['Duration', 'Creation date', 'Content', 'Status'],
    approved_list_attrs: [
      'Requestor',
      'Duration',
      'Creation date',
      'Phone',
      'Email',
    ],
    pending_list_attrs: ['Creation date', 'Duration', 'Content'],
    entry_info: [],
  };

  request_model_attr2headers: any = {
    Requestor: 'requestor_name',
    Duration: 'borrow_duration',
    Status: 'status',
    'Creation date': 'date_s',
    Content: 'content',
    Email: 'requestor_email',
    Phone: 'requestor_phone',
    Name: 'name',
    'Owner name': 'owner_name',
    'Owner phone': 'owner_phone',
    'Max borrow time': 'max_time_borrow',
    Categories: 'categories',
    'Manufactoring date': 'manufacturing_date',
    Producer: 'producer',
    Description: 'description',
    'Expiration date': 'expiration_date_',
  };

  tool_history_to_display = {
    To: 'expiration_date',
    From: 'approval_date',
    Borrower: 'requestor_name',
    Username: 'requestor_username',
  };

  tool_info_to_display = [
    'Name',
    'Owner name',
    'Owner phone',
    'Status',
    'Max borrow time',
    'Categories',
    'Manufactoring date',
    'Producer',
    'Description',
  ];

  edit_state: boolean = false;
  tool_form: any = {
    name: null,
    manufacturing_date: null,
    status: null,
    max_time_borrow: null,
    categories: null,
    producer: null,
    description: null,
  };

  statuses = ['available', 'not available', 'broken'];

  form: any = {
    expiration_date: null,
    borrow_duration: 1,
    content: '',
  };
  approved_borrow_left_time$?: Observable<any>;
  pending_borrow_left_time$?: Observable<any>;

  constructor(
    private route: ActivatedRoute,
    private toolService: ToolService,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.suspended_user = this.storageService.getUser().is_suspended;
    this.sub = this.route.params.subscribe(async (params) => {
      this.tool_id = params['id'];
      this.get_tool_requests();
      this.toolService.getToolById(this.tool_id).subscribe({
        next: async (data) => {
          this.tool_info = data.tool;
          this.get_tool_history();
          this.tool_info.owner_name =
            this.tool_info.owner.name = `${this.capitalize_strings(
              this.tool_info.owner.fname
            )} ${this.capitalize_strings(this.tool_info.owner.lname)}`;
          this.tool_info.owner_phone = this.tool_info.owner.phone;
          if (this.tool_info) {
            this.tool_info.is_my_tool =
              this.storageService.getUser().username ===
              this.tool_info.owner.username; // Display delete btn
          } else {
            this.parse_error_msg('Tool was not found');
            await this.display_alert(false);
            this.router.navigate(['tools']);
          }
          this.cp_tool_to_form();
        },
        error: async (err) => {
          this.parse_error_msg(err);
          await this.display_alert(false);
          this.router.navigate(['tools']);
        },
      });
    });
  }

  get_tool_requests() {
    this.toolService.getToolRequests(this.tool_id).subscribe({
      next: (data) => {
        this.requests.all = JSON.parse(data).requests;
        this.devide_requests();
      },
      error: async (err) => {
        this.parse_error_msg(err);
        await this.display_alert(false);
        this.router.navigate(['tools']);
      },
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  delete_tool() {
    if (confirm(`Are you sure to delete ${this.tool_info.name}?`)) {
      this.toolService.deleteToolById(this.tool_id).subscribe({
        next: async (data) => {
          this.action_msg = JSON.parse(data).message;
          // Print success popup
          // navigate home
          await this.display_alert(true);
          this.router.navigate(['tools']);
        },
        error: async (err) => {
          this.parse_error_msg(err);
          await this.display_alert(false);
        },
      });
    }
  }

  devide_requests() {
    for (let i = 0; i < this.requests.all.length; i++) {
      this.requests.all[i].date_s = this.date2str(this.requests.all[i].date);
      this.requests.all[i].requestor_name =
        this.requests.all[i].requestor.fname +
        ' ' +
        this.requests.all[i].requestor.lname;
      this.requests.all[i].requestor_phone =
        this.requests.all[i].requestor.phone;
      this.requests.all[i].requestor_email =
        this.requests.all[i].requestor.email;
      if (this.requests.all[i].status === 'pending') {
        this.requests.all[i].expiration_date_ = this.date2str(
          this.requests.all[i].expiration_date
        );
        this.requests.open.push(this.requests.all[i]);
        if (
          this.requests.all[i].requestor._id ===
          this.storageService.getUser().id
        ) {
          this.requests.my = this.requests.all[i];

          this.pending_borrow_left_time$ = interval(1000).pipe(
            map((x) =>
              this.calcDateDiff(new Date(this.requests.my.expiration_date))
            ),
            shareReplay(1)
          );
        }
      } else if (this.requests.all[i].status === 'approved') {
        this.approved_borrow_left_time$ = interval(1000).pipe(
          map((x) =>
            this.calcDateDiff(new Date(this.requests.approved.expiration_date))
          ),
          shareReplay(1)
        );

        this.requests.approved = this.requests.all[i];
        if (
          this.requests.all[i].requestor._id ===
          this.storageService.getUser().id
        ) {
          this.requests.my = this.requests.all[i];
        }
      } else {
        this.requests.closed.push(this.requests.all[i]);
      }
    }
  }

  feedback_peer(encourage: boolean) {
    this.toolService
      .feedbackPeer(
        this.storageService.getUser().id,
        this.requests.approved._id,
        encourage
      )
      .subscribe({
        next: async (data) => {
          this.action_msg = data.message;
          // Print success popup
          // navigate home
          this.requests.approved.owner_feedback = data.request.owner_feedback;
          this.requests.approved.my_feedback = data.request.my_feedback;
          await this.display_alert(true);
        },
        error: async (err) => {
          this.parse_error_msg(err);
          await this.display_alert(false);
        },
      });
  }

  open_new_request() {
    if (!this.validate_input()) {
      // Do something
      return;
    }
    let expiration_date = new Date(this.form.expiration_date);
    expiration_date.setMinutes(59);
    expiration_date.setSeconds(59);
    expiration_date.setHours(23);

    this.toolService
      .requestTool(
        this.tool_id,
        expiration_date,
        this.form.borrow_duration,
        this.form.content || ''
      )
      .subscribe({
        next: async (data) => {
          // For UI:
          this.action_msg = data.message;

          data.request.date_s = this.date2str(data.request.date);
          data.request.expiration_date_ = this.date2str(
            data.request.expiration_date
          );
          this.requests.my = data.request;
          this.requests.open.push(data.request);
          this.requests.all.push(data.request);

          this.pending_borrow_left_time$ = interval(1000).pipe(
            map((x) =>
              this.calcDateDiff(new Date(this.requests.my.expiration_date))
            ),
            shareReplay(1)
          );

          await this.display_alert(true);
        },
        error: async (err) => {
          this.parse_error_msg(err);
          await this.display_alert(false);
        },
      });
  }

  validate_input(): boolean {
    return true;
  }

  finish_loan() {
    if (confirm('Are you sure to close the current loan?')) {
      const now = new Date();
      this.toolService
        .updateRequestStatus(this.requests.approved._id, 'closed', now)
        .subscribe({
          next: async (data) => {
            // For UI:
            this.action_msg = data.message;
            this.tool_info.status = 'available';
            this.requests.approved.status = 'closed';
            this.requests.closed.push(this.requests.approved);

            this.requests.approved = null;
            this.approved_borrow_left_time$ = undefined;

            this.get_tool_history();
            await this.display_alert(true);
          },
          error: async (err) => {
            this.parse_error_msg(err);
            await this.display_alert(false);
          },
        });
    }
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

  delete_pending_request() {
    this.toolService.deleteRequest(this.requests.my._id).subscribe({
      next: async (data) => {
        // For UI:
        const res = JSON.parse(data);
        this.action_msg = res.message;
        this.requests.open.pop(this.requests.my);
        this.requests.all.pop(this.requests.my);
        this.requests.my = null;
        await this.display_alert(true);
      },
      error: async (err) => {
        this.parse_error_msg(err);
        this.requests.open.pop(this.requests.my);
        this.requests.all.pop(this.requests.my);
        this.requests.my = null;
        await this.display_alert(false);
      },
    });
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

  collapse(i: any, req_type: string) {
    this.requests[req_type][i].show = false;
  }

  expand(i: any, req_type: string) {
    this.requests[req_type][i].show = true;
  }

  approve_borrow(i: any) {
    const now = new Date().getTime();
    let new_expiration_date = new Date(
      now + 86400000 * this.requests.open[i].borrow_duration
    );
    new_expiration_date.setMinutes(0);
    new_expiration_date.setSeconds(0);
    new_expiration_date.setHours(new_expiration_date.getHours() + 1);
    this.toolService
      .updateRequestStatus(
        this.requests.open[i]._id,
        'approved',
        new_expiration_date
      )
      .subscribe({
        next: async (data) => {
          // For UI:
          this.tool_info.status = 'loaned';
          this.action_msg = data.message;
          this.requests.open[i].status = 'approved';
          this.requests.approved = this.requests.open.pop(
            this.requests.open[i]
          );

          this.approved_borrow_left_time$ = interval(1000).pipe(
            map((x) =>
              this.calcDateDiff(
                new Date(this.requests.approved.expiration_date)
              )
            ),
            shareReplay(1)
          );

          this.get_tool_history();
          await this.display_alert(true);
        },
        error: async (err) => {
          this.parse_error_msg(err);
          await this.display_alert(false);
        },
      });
  }

  reject_borrow(i: any) {
    const now = new Date();
    this.toolService
      .updateRequestStatus(this.requests.open[i]._id, 'rejected', now)
      .subscribe({
        next: async (data) => {
          // For UI:
          this.action_msg = data.message;
          this.requests.open[i].status = 'rejected';
          this.requests.closed.push(
            this.requests.open.pop(this.requests.open[i])
          );
          await this.display_alert(true);
        },
        error: async (err) => {
          this.parse_error_msg(err);
          await this.display_alert(false);
        },
      });
  }

  get_tool_history() {
    this.toolService.getToolHistory(this.tool_id).subscribe({
      next: async (data) => {
        // For UI:
        this.tool_info.history = data.history;
      },
      error: async (err) => {
        this.parse_error_msg(err);
        await this.display_alert(false);
      },
    });
  }

  calcDateDiff(endDay: Date = new Date('1-3-2023 11:00:00')): any {
    const dDay = endDay.valueOf();

    const milliSecondsInASecond = 1000;
    const hoursInADay = 24;
    const minutesInAnHour = 60;
    const secondsInAMinute = 60;

    const timeDifference = dDay - Date.now();

    if (timeDifference <= 0) {
      return {
        hoursToDday: 0,
        minutesToDday: 0,
        secondsToDday: 0,
      };
    }
    
    const daysToDday = Math.floor(
      timeDifference /
        (milliSecondsInASecond *
          minutesInAnHour *
          secondsInAMinute *
          hoursInADay)
    );

    const hoursToDday = Math.floor(
      (timeDifference /
        (milliSecondsInASecond * minutesInAnHour * secondsInAMinute)) %
        hoursInADay
    );

    const minutesToDday = Math.floor(
      (timeDifference / (milliSecondsInASecond * minutesInAnHour)) %
        secondsInAMinute
    );

    const secondsToDday =
      Math.floor(timeDifference / milliSecondsInASecond) % secondsInAMinute;

    return {
      hoursToDday: hoursToDday + hoursInADay * daysToDday,
      minutesToDday: minutesToDday,
      secondsToDday: secondsToDday,
    };
  }

  date2str(date: Date): string {
    const date_ = new Date(date);

    const hours = (date_.getHours() < 10 ? '0' : '') + date_.getHours();
    const minutes = (date_.getMinutes() < 10 ? '0' : '') + date_.getMinutes();
    const seconds = (date_.getSeconds() < 10 ? '0' : '') + date_.getSeconds();
    return `${date_.toLocaleDateString()} ${hours}:${minutes}:${seconds}`;
  }

  local_date_to_str(date: Date): string {
    let date_ = new Date(date).toLocaleDateString();
    let date_l = date_.split('/');
    let str = date_l.pop() + '-';
    for (let i = 0; i < 2; i++) {
      if (date_l[i].length === 1) {
        str += '0';
      }
      str += date_l[i] + '-';
    }

    return str.slice(0, 10);
  }

  capitalize_strings(str: string): string {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
  }

  save_changes() {
    this.edit_state = false;

    let changes: any = {};
    let tmp = this.tool_form;
    let tool_info = this.tool_info;
    Object.keys(this.tool_form).forEach(function (key, index) {
      if (tmp[key] !== tool_info[key]) {
        changes[key] = tmp[key];
      }
    });

    this.toolService.editTool(this.tool_id, changes).subscribe({
      next: async (data) => {
        // For UI:
        this.action_msg = data.message;

        this.cp_tool_to_form(true);

        await this.display_alert(true);
      },
      error: async (err) => {
        this.parse_error_msg(err);
        await this.display_alert(false);
      },
    });
  }

  closeForm() {
    this.edit_state = false;
    this.cp_tool_to_form();
  }

  cp_tool_to_form(reverse: boolean = false) {
    let tmp = this.tool_form;
    let tool_info = this.tool_info;
    Object.keys(this.tool_form).forEach(function (key, index) {
      if (reverse) {
        tool_info[key] = tmp[key];
      } else {
        tmp[key] = tool_info[key];
      }
    });
  }
}
