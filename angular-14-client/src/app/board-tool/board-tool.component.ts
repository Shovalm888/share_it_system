import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../_services/storage.service';
import { ToolService } from '../_services/tool.service';

@Component({
  selector: 'app-board-tool',
  templateUrl: './board-tool.component.html',
  styleUrls: ['./board-tool.component.css'],
})
export class BoardToolComponent implements OnInit {

  delete_msg?: string;
  isBorrowRequestFailed: boolean = false
  isDeletedSucceed: boolean = false;
  isDeletedFailed: boolean = false;
  borrowRequestErrorMessage?: string;
  err_msg?: string;
  tool_id: string = '';
  tool_info: any = {};
  private sub: any;
  tool_open_requests: any = [];
  form: any = {
    expiration_date: null,
    borrow_duration: 1
  }

  constructor(
    private route: ActivatedRoute,
    private toolService: ToolService,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.tool_open_requests = [  // only approved and pending
      {
        requestor: "63ae9c638d6b412cb46d804a",
        tool: "63b0e9bf2012993d00c6d5e0",
        expiration_date: "12/1/2023",
        borrow_duration: "3",
        status: "approved" // rejected, pending, closed
      }
    ]

    this.sub = this.route.params.subscribe((params) => {
      this.tool_id = params['id'];
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
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  delete_tool() {
    this.toolService.deleteToolById(this.tool_id).subscribe({
      next: (data) => {
        this.delete_msg = JSON.parse(data).message;
        // Print success popup
        // navigate home
        this.isDeletedFailed = false;
        this.isDeletedSucceed = true;
        setInterval(() => {
          this.router.navigate(['tools']);
        }, 5 * 1000);
      },
      error: (err) => {
        this.isDeletedFailed = true;
        this.isDeletedSucceed = false;
        if (err.error) {
          try {
            const res = JSON.parse(err.error);
            this.delete_msg = res.message;
          } catch {
            this.delete_msg = `Error with status: ${err.status} - ${err.statusText}`;
          }
        } else {
          this.delete_msg = `Error with status: ${err.status}`;
        }
        // print header alert with err msg
        
      },
    });
  }

  has_open_request(): boolean{
    for(let i = 0; i < this.tool_open_requests.length; i++){
      if(this.tool_open_requests[i].requesrot === this.storageService.getUser()._id){
        return true;
      }
    }
    return false;
  }

  onSubmit(){

  }
}
