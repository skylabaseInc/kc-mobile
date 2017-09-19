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
    return Observable.fromPromise<Office>(this.Store.getUpdate("office_doc").then(row => {
      var elements = row.data.offices.push(office);
      this.updateStoreOffice('office_doc', row._rev, row.data.offices, elements, row.data.totalPages);
    }))
    .catch(Error.handleError);
  }

  addBranch(id: string, office: Office): Observable<Office>{

    return Observable.fromPromise<Office>(this.Store.getUpdate("office_doc").then(row => {
      var elements = row.data.offices.push(office);
      this.updateStoreOffice('office_doc', row._rev, row.data.offices, elements, row.data.totalPages);
    }))
    .catch(Error.handleError);
  }

  updateOffice(office: Office): Observable<Office>{
    return Observable.fromPromise<Office>(this.Store.getUpdate('office_doc').then(row => {
      var index = row.data.offices.findIndex(element => element.identifier == office.identifier);
      row.data.offices.splice(index, 1);
      row.data.offices.splice(index, 0, office);

      this.updateStoreOffice("office_doc", row._rev, row.data.offices, row.data.totalElements, row.data.totalPages);
    }))
    .catch(Error.handleError)
  }

  deleteOffice(id: String): Observable<Office>{
    return Observable.fromPromise<Office>(this.Store.getUpdate('office_doc').then(row => {
      
      var index = row.data.offices.findIndex(office => office.indentifier == id);
      row.data.offices.splice(index, 1);

      this.updateStoreOffice("office_doc", row._rev, row.data.offices, row.data.totalElements+1, row.data.totalPages);
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
        .catch(Error.handleError);
  }

  listBranches(parentIdentifier: string, fetchRequest?: FetchRequest): Observable<OfficePage>{
    let params: URLSearchParams = buildSearchParams(fetchRequest);

    let requestOptions: RequestOptionsArgs = {
      search: params
    };

    return Observable.fromPromise<OfficePage>(this.Store.getUpdate('office_doc').then(row => {
      var data = row.data.offices;

      // ensure that branches are always of the parent branch
      var branches = data.filter(element => element.parentIdentifier == parentIdentifier);

      row.data.offices = branches;
      this.branches = row.data;
    }))
    .map(office => this.branches)
    .catch(Error.handleError);
  }

  getOffice(id: string): Observable<Office>{
    return Observable.fromPromise<Office>(this.Store.getUpdate('office_doc').then(row => {
      var branch_office = row.data.offices.filter(element => element.identifier == id);
      this.office = branch_office;
    }))
    .map(office => this.office[0])
    .catch(Error.handleError);
  }

  listEmployees(fetchRequest?: FetchRequest): Observable<EmployeePage>{
    let params: URLSearchParams = buildSearchParams(fetchRequest);

    let requestOptions: RequestOptionsArgs = {
      search: params
    };

    return Observable.fromPromise<EmployeePage>(this.Store.get('employee_doc'))
        .map(data => data)
        .catch(Error.handleError);
  }

  getEmployee(id: string, silent?: true): Observable<Employee>{

    return Observable.fromPromise<Employee>(this.Store.getUpdate('employee_doc').then(row => {
      this.employee = row.data.employees.filter(element => element.identifier == id);
    }))
    .map(employee => this.employee[0])
    .catch(Error.handleError);
  }

  createEmployee(employee: Employee): Observable<Employee>{
    
    return Observable.fromPromise<Employee>(this.Store.getUpdate('employee_doc').then(row => {
      var elements = row.data.employees.push(employee);
      this.updateStoreEmployees('employee_doc', row._rev, row.data.employees, elements, row.data.totalPages);
    }))
    .catch(Error.handleError);
  }

  updateEmployee(employee: Employee): Observable<Employee>{
    
    return Observable.fromPromise<Employee>(this.Store.getUpdate('employee_doc').then(row => {
      var index = row.data.employees.findIndex(element => element.identifier == employee.identifier);
      
      // remove old employee and replace with new employee object
      var removedItems = row.data.employees.splice(index, 1);
      row.data.employees.splice(index, 0, employee);

      this.updateStoreEmployees('employee_doc', row._rev, row.data.employees, row.data.totalElements + 1, row.data.totalPages);
    }))
    .catch(Error.handleError);
  }

  deleteEmployee(id: string): Observable<Employee>{
    
    return Observable.fromPromise<Employee>(this.Store.getUpdate('employee_doc').then(row => {

      var index = row.data.employees.findIndex(element => element.identifier == id);
      var removedItems = row.data.employees.splice(index, 1); // delete the chosen employee
 
      this.updateStoreEmployees('employee_doc', row._rev, row.data.employees, row.data.totalElements + 1, row.data.totalPages);
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
    });
  }

  updateStoreOffice(id, rev, data, elements, pages) {
    this.Store.update({
      "_id": "office_doc",
      "_rev": rev,
      "data": {
        "offices": data,
        "totalElements": elements,
        "totalPages": pages
      }
    });
  }

}
