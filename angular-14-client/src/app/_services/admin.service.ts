import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/test/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient) {}

  setOrganizationCode(organization_code: string): Observable<any> {
    return this.http.post(
      API_URL + 'organization_code',
      {
        organization_code,
      },
      httpOptions
    );
  }
}
