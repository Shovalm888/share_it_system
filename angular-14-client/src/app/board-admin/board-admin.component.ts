import { Component, OnInit } from '@angular/core';
import { AdminService } from '../_services/admin.service';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-board-admin',
  templateUrl: './board-admin.component.html',
  styleUrls: ['./board-admin.component.css'],
})
export class BoardAdminComponent implements OnInit {
  content?: string;
  organization_form: any = {
    organization_code: null,
  };

  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

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
    this.userService.getAdminBoard().subscribe({
      next: (data) => {
        this.content = data;
      },
      error: (err) => {
        if (err.error) {
          try {
            const res = JSON.parse(err.error);
            this.content = res.message;
          } catch {
            this.content = `Error with status: ${err.status} - ${err.statusText}`;
          }
        } else {
          this.content = `Error with status: ${err.status}`;
        }
      },
    });
  }

  /**
   * The function is called when the user clicks the submit button on the form.
   * The function then calls the adminService.setOrganizationCode() function, which is defined in the
   * admin.service.ts file.
   */
  onSetOrganizationCode(): void {
    const organization_code = this.organization_form.organization_code;

    this.adminService.setOrganizationCode(organization_code).subscribe({
      next: (data) => {
        console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      },
    });
  }
}
