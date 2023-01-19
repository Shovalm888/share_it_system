import { Component, OnInit } from '@angular/core';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  content?: string;
  current_user?: any;
  err_msg?: string;

  constructor(
    private user_service: UserService,
    private userService: UserService) {}

    form: any = {
      fname: null,
      lname: null,
      email: null,
      phone: null,
      password: null,
      job: null,
      description: null,
      allow_emails: false,
    };
    

    capitalize_strings(str: string): string {
      return str.slice(0, 1).toUpperCase() + str.slice(1);
    }

  /**
   * The function is called when the component is initialized. It calls the getPublicContent() function
   * in the userService.ts file. If the function is successful, the data is assigned to the content
   * variable. If the function is unsuccessful, the error is assigned to the content variable.
   */

  
  ngOnInit(): void {
    this.user_service.getUser().subscribe({
      next: (data) => {
        let tmp = this.form;
        this.current_user = data.user;
        this.current_user.full_name = `${this.capitalize_strings(
          this.current_user.fname
        )} ${this.capitalize_strings(this.current_user.lname)}`;
        Object.keys(this.form).forEach(function (key, index) {
          if (key !== 'password') {
            tmp[key] = data.user[key];
          }
        });
    this.userService.getPublicContent().subscribe({
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
}