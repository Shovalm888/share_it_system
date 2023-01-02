import { UserService } from './../_services/user.service';
import { Component, OnInit } from '@angular/core';
import { StorageService } from '../_services/storage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: any;
  err_msg?: string;

  constructor(private storageService: StorageService, private user_service: UserService) { }

  ngOnInit(): void {
    const self_id = this.storageService.getUser().id;
    this.user_service.getUsersById(self_id).subscribe({
      next: data => {
        this.currentUser = data.user;
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
    })
  }
}
