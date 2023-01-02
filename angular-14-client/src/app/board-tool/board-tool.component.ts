import { animate, AUTO_STYLE, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../_services/storage.service';
import { ToolService } from '../_services/tool.service';

const DEFAULT_DURATION = 4000;
@Component({
  selector: 'app-board-tool',
  templateUrl: './board-tool.component.html',
  styleUrls: ['./board-tool.component.css'],
  animations: [
    // trigger('fade', [
    //   transition('false => true', [ // using status here for transition
    //     style({ opacity: 0 }),
    //     animate(1000, style({ opacity: 1 }))
    //   ]),
    //   transition('true => false', [
    //     animate(1000, style({ opacity: 0 }))
    //   ])
    // ]),
    trigger('fade', [
      state('false', style({ visibility: AUTO_STYLE, opacity: 0 })),
      state('true', style({ visibility: AUTO_STYLE, opacity: 1 })),
      transition('false => true', animate(1000, style({ opacity: 1 }))),
      transition('true => false', animate(DEFAULT_DURATION, style({ opacity: 0 })))
    ])
  ]
})

export class BoardToolComponent implements OnInit {
  action_msg?: string;
  isBorrowRequestFailed: boolean = false;
  isActionSucceed: boolean = false;
  isActionFailed: boolean = false;
  borrowRequestErrorMessage?: string;
  err_msg?: string;
  tool_id: string = '';
  tool_info: any = {};
  private sub: any;
  requests: any = {
    open: [],
    closed: [],
    all: [],
    my: null,
  };
  form: any = {
    expiration_date: null,
    borrow_duration: 1,
    content: '',
  };

  constructor(
    private route: ActivatedRoute,
    private toolService: ToolService,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.sub = this.route.params.subscribe(async (params) => {
      this.tool_id = params['id'];
      this.get_tool_requests();
      this.toolService.getToolById(this.tool_id).subscribe({
        next: (data) => {
          this.tool_info = JSON.parse(data).tool;
          if (this.tool_info.length >= 1) {
            this.tool_info = this.tool_info[0];
            this.tool_info.is_my_tool =
              this.storageService.getUser().username ===
              this.tool_info.owner.username; // Display delete btn
          }
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

  devide_requests() {
    for (let i = 0; i < this.requests.all.length; i++) {
      if (['pending', 'approved'].includes(this.requests.all[i].status)) {
        this.requests.open.push(this.requests.all[i]);

        if (
          this.requests.all[i].requestor._id === this.storageService.getUser().id
        ) {
          this.requests.my = this.requests.all[i];
          this.requests.my.remaining_days = this.get_remaining_days(
            this.requests.my
          );
        }
      } else {
        this.requests.closed.push(this.requests.all[i]);
      }
    }
  }

  get_remaining_days(request: any): any {
    const current_date = new Date().getTime();
    const expiration_date =
      request.status != 'approved'
        ? new Date(request.expiration_date).getTime()
        : new Date(request.approval_date).getTime();

    return Math.floor((expiration_date - current_date) / (60 * 60 * 24 * 1000));
  }

  onSubmit() {
    if (!this.validate_input()) {
      // Do something
      return;
    }
    this.toolService
      .requestTool(
        this.tool_id,
        this.storageService.getUser().id,
        this.form.expiration_date,
        this.form.borrow_duration,
        this.form.content || ''
      )
      .subscribe({
        next: async (data) => {
          // For UI:
          this.action_msg = data.message;
          // setInterval(() => {
          //   this.router.navigate(['tools']);
          // }, 5 * 1000);
          // Update requests locally:
          this.requests.my = data.request;
          this.requests.open.push(data.request);
          this.requests.all.push(data.request);
          this.requests.my.remaining_days = this.get_remaining_days(
            this.requests.my
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

  parse_error_msg(err: any) {
    if (err.error) {
      try {
        const res = JSON.parse(err.error);
        this.action_msg = res.message;
      } catch {
        this.action_msg = `Error with status: ${err.status} - ${err.statusText}`;
      }
    } else {
      this.action_msg = `Error with status: ${err.status}`;
    }
  }

  delete_pending_request() {
    this.toolService.deleteRequest(this.requests.my._id).subscribe(
      {
        next: async (data) => {
          // For UI:
          const res = JSON.parse(data);
          this.action_msg = res.message;
          this.requests.my = null;
          this.requests.open.pull(res.request);
          this.requests.all.pull(res.request);
          await this.display_alert(true);

        },
        error: async (err) => {
          this.parse_error_msg(err);
          await this.display_alert(false);
        },
      }
    )
  }

  delay(sec: number) {
    return new Promise((resolve) => setTimeout(resolve, sec * 1000));
  }

  async display_alert(is_sucess: boolean) {
    if (is_sucess) {
      this.isActionFailed = false;
      this.isActionSucceed = true;
      await this.delay(4);
      this.isActionSucceed = false;
    } else {
      this.isActionFailed = true;
      this.isActionSucceed = false;
      await this.delay(4);
      this.isActionFailed = false;
    }
  }
}
