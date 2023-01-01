import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const TOOL_API = 'http://localhost:8080/api/tool/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})
export class ToolService {

  constructor(private http: HttpClient) { }

  addTool(name: string, manufacturing_date: any, status: string, max_time_borrow: any, categories: string, producer: string, owner: any, description: string): Observable<any> {
    return this.http.post(
      TOOL_API + 'add',
      {
        name, 
        manufacturing_date, 
        status, 
        max_time_borrow, 
        categories, 
        producer, 
        owner, 
        description
      },
      httpOptions
    );
  }

  getAllTools(): Observable<any> {
    return this.http.get(TOOL_API + 'tools', { responseType: 'text' });
  }
}
