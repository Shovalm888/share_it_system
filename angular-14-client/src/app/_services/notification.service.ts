import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const NOTIFICATION_API = 'http://localhost:8080/api/notification/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
/* It's a service that uses the HttpClient to delete a notification */
export class NotificationService {
  constructor(private http: HttpClient) {}

  deleteNotification(id: any): Observable<any> {
    return this.http.delete(NOTIFICATION_API + id);
  }
}
