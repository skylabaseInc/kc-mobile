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

  private testData: any;

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
    return this.http.put(this.baseUrl + '/offices/' + office.identifier, office)
      .catch(Error.handleError);
  }

  deleteOffice(id: String): Observable<Office>{
    return this.http.delete(this.baseUrl + '/offices/' + id, {})
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

    return this.http.get(this.baseUrl + '/offices/' + parentIdentifier + '/branches', requestOptions)
      .catch(Error.handleError);
  }

  getOffice(id: string): Observable<Office>{
    return this.http.get(this.baseUrl + '/offices/' + id)
      .catch(Error.handleError);
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
    return this.http.get(this.baseUrl + '/employees/' + id, {}, silent)
      .catch(Error.handleError);
  }

  createEmployee(employee: Employee): Observable<Employee>{
    
    return Observable.fromPromise<Employee>(this.Store.getUpdate('employee_doc').then(row => {
      console.log(row._rev);
      this.Store.update({
        "_id": "employee_doc",
        "_rev": row._rev,  // specify this to avoid update conflicts
        "data": row.data.employees.push(employee),
        "totalElements": row.data.totalElements + 1
      });
    }))
    .catch(Error.handleError);
  }

  updateEmployee(employee: Employee): Observable<Employee>{
    return this.http.put(this.baseUrl + '/employees/' + employee.identifier, employee)
      .catch(Error.handleError);
  }

  deleteEmployee(id: string): Observable<Employee>{
    return this.http.delete(this.baseUrl + '/employees/' + id, {})
      .catch(Error.handleError);
  }

  setContactDetails(id: string, contactDetails: ContactDetail[]): Observable<void>{
    return this.http.put(this.baseUrl + '/employees/' + id + '/contacts', contactDetails);
  }

}
