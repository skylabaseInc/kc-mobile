/**
 * Copyright 2017 The Mifos Initiative.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Injectable, Inject} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '../http/http.service';
import {Error} from '../domain/error.model';
import {RequestOptionsArgs, URLSearchParams} from '@angular/http';
import {Office} from './domain/office.model';
import {FetchRequest} from '../domain/paging/fetch-request.model';
import {OfficePage} from './domain/office-page.model';
import {EmployeePage} from './domain/employee-page.model';
import {Employee} from './domain/employee.model';
import {buildSearchParams} from '../domain/paging/search-param.builder';
import {ContactDetail} from '../domain/contact/contact-detail.model';
import {OfflineStoreService} from '../offlineStore/offlineStore.service';

@Injectable()
export class OfficeService{

  private employee: Employee;
  private office: Office;
  private branches: OfficePage;

  constructor(private http: HttpClient, @Inject('officeBaseUrl') private baseUrl: string, private Store: OfflineStoreService) {}

  createOffice(office: Office): Observable<Office>{
    return this.http.post(this.baseUrl + '/offices', office)
      .catch(Error.handleError);
  }

  addBranch(id: string, office: Office): Observable<Office>{
    return this.http.post(this.baseUrl + '/offices/' + id, office)
      .catch(Error.handleError);
  }

  updateOffice(office: Office): Observable<Office>{
    return Observable.fromPromise<Office>(this.Store.getUpdate('branches_doc').then(row => {
      var data = row.data.offices;
      var index = data.findIndex(element => element.identifier == office.identifier);
      var removedOffice = data.splice(index, 1);
      data.splice(index, 0, office);

      this.updateStoreBranches("branches_doc", row._rev, data, row.data.totalElements+1, row.data.totalPages);
    }))
    .catch(Error.handleError)
  }

  deleteOffice(id: String): Observable<Office>{
    return Observable.fromPromise<Office>(this.Store.getUpdate('branches_doc').then(row => {
      var data = row.data.offices;
      var index = data.findIndex(office => office.indentifier == id);
      var removedOffice = data.splice(index, 1);

      this.updateStoreBranches("branches_doc", row._rev, data, row.data.totalElements+1, row.data.totalPages);
    }))
    .catch(Error.handleError);
  }

  listOffices(fetchRequest?: FetchRequest): Observable<OfficePage>{
    let params: URLSearchParams = buildSearchParams(fetchRequest);

    let requestOptions: RequestOptionsArgs = {
      search: params
    };

    return Observable.fromPromise<OfficePage>(this.Store.get('office_doc'))
        .map(data => data)
        .do(data => console.log('[OK] Office data gotten!'));
  }

  listBranches(parentIdentifier: string, fetchRequest?: FetchRequest): Observable<OfficePage>{
    let params: URLSearchParams = buildSearchParams(fetchRequest);

    let requestOptions: RequestOptionsArgs = {
      search: params
    };

    return Observable.fromPromise<OfficePage>(this.Store.getUpdate('branches_doc').then(row => {
      var data = row.data.offices;
      // ensure that branches are always of the parent branch
      var branches = data.filter(element => element.parentIdentifier == parentIdentifier);
      row.data.offices = branches;
      this.branches = row.data;
    }))
    .map(office => this.branches)
    .do(office => console.log('[OK] Branches: ', office))
    .catch(Error.handleError);
  }

  getOffice(id: string): Observable<Office>{
    return this.http.get(this.baseUrl + '/offices/' + id)
      .catch(Error.handleError);

      // return Observable.fromPromise<Office>(this.Store.getUpdate('office_doc').then(row => {
      //   var data = row.data.offices;
      //   this.office = data.filter(element => element.identifier == id);
      // }))
      // .map(office => this.office[0])
      // .do(office => console.log('[OK] Office: ', office));
  }

  listEmployees(fetchRequest?: FetchRequest): Observable<EmployeePage>{
    let params: URLSearchParams = buildSearchParams(fetchRequest);

    let requestOptions: RequestOptionsArgs = {
      search: params
    };

    return Observable.fromPromise<EmployeePage>(this.Store.get('employee_doc'))
        .map(data => data)
        .do(data => console.log('[OK] Employee data gotten! '));
  }

  getEmployee(id: string, silent?: true): Observable<Employee>{

    return Observable.fromPromise<Employee>(this.Store.getUpdate('employee_doc').then(row => {
      var data = row.data.employees;
      this.employee = data.filter(element => element.identifier == id);
    }))
    .map(employee => this.employee[0])
    .do(employee => console.log('[OK] Employee: ', employee));
  }

  createEmployee(employee: Employee): Observable<Employee>{
    
    return Observable.fromPromise<Employee>(this.Store.getUpdate('employee_doc').then(row => {
      var updatedData = row.data.employees;
      var count = updatedData.push(employee);
      var elements = count;
      var pages = row.data.totalPages;

      this.updateStoreEmployees('employee_doc', row._rev, updatedData, elements, pages);
    }))
    .catch(Error.handleError);
  }

  updateEmployee(employee: Employee): Observable<Employee>{
    
    return Observable.fromPromise<Employee>(this.Store.getUpdate('employee_doc').then(row => {
      var updatedData = row.data.employees;
      var index = updatedData.findIndex(element => element.identifier == employee.identifier);
      var removedItems = updatedData.splice(index, 1); // remove old employee data
      updatedData.splice(index, 0, employee); // add new employee at the same index
      
      var elements = row.data.totalElements + 1;
      var pages = row.data.totalPages;

      this.updateStoreEmployees('employee_doc', row._rev, updatedData, elements, pages);
    }))
    .catch(Error.handleError);
  }

  deleteEmployee(id: string): Observable<Employee>{
    
    return Observable.fromPromise<Employee>(this.Store.getUpdate('employee_doc').then(row => {
      var updatedData = row.data.employees;
      var index = updatedData.findIndex(element => element.identifier == id);
      var removedItems = updatedData.splice(index, 1); // delete the chosen employee
      
      var elements = row.data.totalElements + 1;
      var pages = row.data.totalPages;

      this.updateStoreEmployees('employee_doc', row._rev, updatedData, elements, pages);
    }))
    .catch(Error.handleError);
  }

  setContactDetails(id: string, contactDetails: ContactDetail[]): Observable<void>{
    return this.http.put(this.baseUrl + '/employees/' + id + '/contacts', contactDetails);
  }

  // Helper functions
  updateStoreEmployees(id, rev, data, elements, pages) {
    this.Store.update({
      "_id": id,
      "_rev": rev, // specify this to avoid update conflicts
      "data": {
        "employees": data,
        "totalElements": elements,
        "totalPages": pages
      }
    })
  }

  updateStoreBranches(id, rev, data, elements, pages) {
    this.Store.update({
      "_id": "branches_doc",
      "_rev": rev,
      "data": {
        "offices": data,
        "totalElements": elements,
        "totalPages": pages
      }
    })
  }

}
