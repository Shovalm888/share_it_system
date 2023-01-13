import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/test/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getPublicContent(): Observable<any> {
    return this.http.get(API_URL + 'all', { responseType: 'text' });
  }

  getUserBoard(): Observable<any> {
    return this.http.get(API_URL + 'user', { responseType: 'text' });
  }

  getModeratorBoard(): Observable<any> {
    return this.http.get(API_URL + 'mod', { responseType: 'text' });
  }

  getAdminBoard(): Observable<any> {
    return this.http.get(API_URL + 'admin', { responseType: 'text' });
  }

  getAllUsers(): Observable<any> {
    return this.http.get(API_URL + 'users', { responseType: 'text' });
  }

  getUser(): Observable<any> {
    return this.http.get(API_URL + 'user');
  }

  updateUser(params_dict: any): Observable<any> {
    return this.http.post(API_URL + 'user/update-user', params_dict, httpOptions);
  }

  suspendUser(id: any): Observable<any> {
    return this.http.post(API_URL + 'user/suspend/' + id , httpOptions);
  }

  elevatedUser(id: any): Observable<any> {
    return this.http.post(API_URL + 'user/elevated/' + id , httpOptions);
  }

  deleteUser(id: any): Observable<any> {
    return this.http.post(API_URL + 'user/delete/' + id , httpOptions);
  }
}
