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

import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Customer} from './domain/customer.model';
import {HttpClient} from '../http/http.service';
import {CustomerPage} from './domain/customer-page.model';
import {FetchRequest} from '../domain/paging/fetch-request.model';
import {buildSearchParams} from '../domain/paging/search-param.builder';
import {RequestOptionsArgs, URLSearchParams} from '@angular/http';
import {Command} from './domain/command.model';
import {TaskDefinition} from './domain/task-definition.model';
import {ImageService} from '../image/image.service';
import {IdentificationCard} from './domain/identification-card.model';
import {IdentificationCardScan} from './domain/identification-card-scan.model';
import {OfflineStoreService} from '../offlineStore/offlineStore.service';

@Injectable()
export class CustomerService {

  private customer: Customer;

  constructor(@Inject('customerBaseUrl') private baseUrl: string, private http: HttpClient, private imageService: ImageService, private Store: OfflineStoreService) {}

  fetchCustomers(fetchRequest: FetchRequest): Observable<CustomerPage> {
    const params: URLSearchParams = buildSearchParams(fetchRequest);

    const requestOptions: RequestOptionsArgs = {
      search: params
    };

    return Observable.fromPromise<CustomerPage>(this.Store.get('customer_doc'))
        .map(data => data);
  }

  getCustomer(id: string, silent?: boolean): Observable<Customer>{
    return Observable.fromPromise<Customer>(this.Store.getUpdate('customer_doc').then(row => {
      this.customer = row.data.customers.filter(element => element.identifier == id);
    }))
    .map(customer => this.customer[0])
  }

  createCustomer(customer: Customer): Observable<Customer>{
    
    return Observable.fromPromise<Customer>(this.Store.getUpdate('customer_doc').then(row => {
      var elements = row.data.customers.push(customer);
      this.updateStoreCustomers('customer_doc', row._rev, row.data.customers, elements, row.data.totalPages);
    }));
  }

  updateCustomer(customer: Customer): Observable<Customer>{
    
    return Observable.fromPromise<Customer>(this.Store.getUpdate('customer_doc').then(row => {
      var index = row.data.customers.findIndex(element => element.identifier == customer.identifier);
      row.data.customers.splice(index, 1);
      row.data.customers.splice(index, 0, customer);

      this.updateStoreCustomers('customer_doc', row._rev, row.data.customers, row.data.totalElements, row.data.totalPages);
    }));
  }

  executeCustomerCommand(id: string, command: Command): Observable<void>{
    return this.http.post(`${this.baseUrl}/customers/${id}/commands`, command);
  }

  listCustomerCommand(id: string): Observable<Command[]>{
    return this.http.get(`${this.baseUrl}/customers/${id}/commands`);
  }

  addTaskToCustomer(customerId: string, taskId: string): Observable<void>{
    return this.http.post(`${this.baseUrl}/customers/${customerId}/tasks/${taskId}`, {})
  }

  markTaskAsExecuted(customerId: string, taskId: string): Observable<void>{
    return this.http.put(`${this.baseUrl}/customers/${customerId}/tasks/${taskId}`, {});
  }

  fetchCustomerTasks(customerId: string, includeExecuted?: boolean): Observable<TaskDefinition[]>{
    return this.http.get(`${this.baseUrl}/customers/${customerId}/tasks`)
  }

  fetchTasks(): Observable<TaskDefinition[]> {
    return Observable.fromPromise<TaskDefinition[]>(this.Store.get('tasks_doc'))
    .map(data => data)
  }

  createTask(task: TaskDefinition): Observable<void> {
    return Observable.fromPromise<void>(this.Store.getUpdate('tasks_doc').then(row => {
      var tasks = row.data.push(task);
      this.updateStoreTasks('tasks_doc', row._rev, tasks);
    }));
  }

  getPortrait(customerId: string): Observable<Blob> {
    return this.imageService.getImage(`${this.baseUrl}/customers/${customerId}/portrait`);
  }

  uploadPortrait(customerId: string, file: File): Observable<void> {
    const formData = new FormData();

    formData.append('portrait', file, file.name);

    return this.http.post(`${this.baseUrl}/customers/${customerId}/portrait`, formData);
  }

  deletePortrait(customerId: string): Observable<void> {
    return this.http.delete(`${this.baseUrl}/customers/${customerId}/portrait`)
  }

  fetchIdentificationCards(customerId: string): Observable<IdentificationCard[]> {
    return this.http.get(`${this.baseUrl}/customers/${customerId}/identifications`)
  }

  getIdentificationCard(customerId: string, number: string): Observable<IdentificationCard> {
    return this.http.get(`${this.baseUrl}/customers/${customerId}/identifications/${number}`)
  }

  createIdentificationCard(customerId: string, identificationCard: IdentificationCard): Observable<void> {
    return this.http.post(`${this.baseUrl}/customers/${customerId}/identifications`, identificationCard)
  }

  updateIdentificationCard(customerId: string, identificationCard: IdentificationCard): Observable<void> {
    return this.http.put(`${this.baseUrl}/customers/${customerId}/identifications/${identificationCard.number}`, identificationCard)
  }

  deleteIdentificationCard(customerId: string, number: string): Observable<void> {
    return this.http.delete(`${this.baseUrl}/customers/${customerId}/identifications/${number}`)
  }

  fetchIdentificationCardScans(customerId: string, number: string): Observable<IdentificationCardScan[]> {
    return this.http.get(`${this.baseUrl}/customers/${customerId}/identifications/${number}/scans`)
  }

  getIdentificationCardScanImage(customerId: string, number: string, scanId: string): Observable<Blob> {
    return this.imageService.getImage(`${this.baseUrl}/customers/${customerId}/identifications/${number}/scans/${scanId}/image`);
  }

  uploadIdentificationCardScan(customerId: string, number: string, scan: IdentificationCardScan, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('image', file, file.name);

    const params = new URLSearchParams();
    params.append('scanIdentifier', scan.identifier);
    params.append('description', scan.description);

    const requestOptions: RequestOptionsArgs = {
      search: params
    };

    return this.http.post(`${this.baseUrl}/customers/${customerId}/identifications/${number}/scans`, formData, requestOptions);
  }

  deleteIdentificationCardScan(customerId: string, number: string, scanId: string): Observable<void> {
    return this.http.delete(`${this.baseUrl}/customers/${customerId}/identifications/${number}/scans/${scanId}`);
  }

  updateStoreCustomers(id, rev, data, elements, pages){
    this.Store.update({
      "_id": "customer_doc",
      "_rev": rev,
      "data": {
        "customers": data,
        "totalElements": elements,
        "totalPages": pages
      }
    });
  }

  updateStoreTasks(id, rev, data) {
    this.Store.update({ "_id": id, "_rev": rev, "data": data });
  }
}
