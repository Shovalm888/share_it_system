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

  deleteRequest(id: any): Observable<any> {
    return this.http.delete(TOOL_API + 'board-tool/requests/' + id, { responseType: 'text' });
  }

  getRequests(): Observable<any> {
    return this.http.get(TOOL_API + 'board-tool/requests/', { responseType: 'text' });
  }

  getToolRequests(id: any): Observable<any> {
    return this.http.get(TOOL_API + 'board-tool/requests/' + id, { responseType: 'text' });
  }

  getAllTools(): Observable<any> {
    return this.http.get(TOOL_API + 'tools', { responseType: 'text' });
  }

  getToolById(id: string): Observable<any> {
    return this.http.get(TOOL_API + 'board-tool/' + id, { responseType: 'text' });
  }

  deleteToolById(id: string): Observable<any> {
    return this.http.delete(TOOL_API + 'board-tool/' + id, { responseType: 'text' });
  }

  requestTool(id: string, requestor: string, expiration_date: string, borrow_duration: string, content: string): Observable<any> {
    return this.http.post(TOOL_API + 'board-tool/' + id, 
    { 
      requestor: requestor,
      expiration_date: expiration_date,
      borrow_duration: borrow_duration,
      content: content
    },
    httpOptions
    );
  }

}
