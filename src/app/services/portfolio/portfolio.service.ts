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
import {HttpClient} from '../http/http.service';
import {Observable} from 'rxjs';
import {Product} from './domain/product.model';
import {RequestOptionsArgs, URLSearchParams} from '@angular/http';
import {TaskDefinition} from './domain/task-definition.model';
import {ChargeDefinition} from './domain/charge-definition.model';
import {FetchRequest} from '../domain/paging/fetch-request.model';
import {buildSearchParams} from '../domain/paging/search-param.builder';
import {CaseCommand} from './domain/case-command.model';
import {TaskInstance} from './domain/task-instance.model';
import {PlannedPaymentPage} from './domain/individuallending/planned-payment-page.model';
import {CasePage} from './domain/case-page.model';
import {AccountAssignment} from './domain/account-assignment.model';
import {WorkflowAction} from './domain/individuallending/workflow-action.model';
import {ProductPage} from './domain/product-page.model';
import {CostComponent} from './domain/individuallending/cost-component.model';
import {FimsCase} from './domain/fims-case.model';
import {FimsCasePage} from './domain/fims-case-page.model';
import {Case} from './domain/case.model';
import {mapToCase, mapToFimsCase, mapToFimsCases} from './domain/mapper/fims-case.mapper';
import {mapToFimsCasePage} from './domain/mapper/fims-case-page.mapper';
import {OfflineStoreService} from '../offlineStore/offlineStore.service';

@Injectable()
export class PortfolioService {

  private product: Product;

  constructor(private http: HttpClient, @Inject('portfolioBaseUrl') private baseUrl: string, private Store: OfflineStoreService) {}

  findAllPatterns(): Observable<void>{
    return this.http.get(`${this.baseUrl}/patterns/`)
  }

  findAllProducts(includeDisabled?: boolean, fetchRequest?: FetchRequest): Observable<ProductPage> {
    const params: URLSearchParams = buildSearchParams(fetchRequest);
    params.append('includeDisabled', includeDisabled ? 'true' : 'false');

    const requestOptions: RequestOptionsArgs = {
      search: params
    };
    return Observable.fromPromise<ProductPage>(this.Store.get('product_doc'))
    .map(data => data);
  }

  createProduct(product: Product): Observable<void>{
    return Observable.fromPromise<void>(this.Store.getUpdate('product_doc').then(row => {
      var elements = row.data.elements.push(product);
      this.updateStoreProducts('product_doc', row._rev, row.data.elements, elements, row.data.totalPages);
    }))
  }

  getProduct(identifier: string): Observable<Product>{
    return Observable.fromPromise<Product>(this.Store.getUpdate('product_doc').then(row => {
      this.product = row.data.elements.filter(element => element.identifier == identifier);
    }))
    .map(product => this.product[0]);
  }

  changeProduct(product: Product): Observable<void>{
    
    return Observable.fromPromise<void>(this.Store.getUpdate('product_doc').then(row => {
      var index = row.data.elements.findIndex(element => element.identifier == product.identifier);
      var removedItem = row.data.elements.splice(index, 1);
      row.data.elements.splice(index, 0, product);

      this.updateStoreProducts('product_doc', row._rev, row.data.elements, row.data.totalElements, row.data.totalPages);
    }))
  }

  deleteProduct(identifier: string): Observable<void> {
    return Observable.fromPromise<void>(this.Store.getUpdate('product_doc').then(row => {

      var index = row.data.elements.findIndex(element => element.identifier == identifier);
      var removedItem = row.data.elements.splice(index, 1);

      this.updateStoreProducts('product_doc', row._rev, row.data.elements, row.data.totalElements, row.data.totalPages);
    }));
  }

  enableProduct(identifier: string, enabled: boolean): Observable<void>{
    return Observable.fromPromise<void>(this.Store.getUpdate('product_doc').then(row => {
      var index = row.data.elements.findIndex(element => element.identifier == identifier);
      this.product = row.data.elements.filter(element => element.identifier == identifier);
      this.product.enabled = enabled;

      var removedItem = row.data.elements.splice(index, 1);
      row.data.elements.splice(index, 0, this.product);

      this.updateStoreProducts('product_doc', row._rev, row.data.elements, row.data.totalElements, row.data.totalPages);
    }))
  }

  getProductEnabled(identifier: string): Observable<boolean>{
    return Observable.fromPromise<boolean>(this.Store.getUpdate('product_doc').then(row => {
      this.product = row.data.elements.filter(element => element.identifier == identifier && element.enabled == true);
    }))
    .map(product => this.product[0]);
  }

  // TODO: Update CouchDB data to proceed with doing offline data support 
  // ..... for tasks, cases and charges
  incompleteaccountassignments(identifier: string): Observable<AccountAssignment[]> {
    return this.http.get(`${this.baseUrl}/products/${identifier}/incompleteaccountassignments`)
  }

  findAllTaskDefinitionsForProduct(identifier: string): Observable<TaskDefinition[]>{
    return this.http.get(`${this.baseUrl}/products/${identifier}/tasks/`)
  }

  createTaskDefinition(productIdentifier: string, taskDefinition: TaskDefinition): Observable<void>{
    return this.http.post(`${this.baseUrl}/products/${productIdentifier}/tasks/`, taskDefinition)
  }

  getTaskDefinition(productIdentifier: string, taskDefinitionIdentifier: string): Observable<TaskDefinition>{
    return this.http.get(`${this.baseUrl}/products/${productIdentifier}/tasks/${taskDefinitionIdentifier}`)
  }

  changeTaskDefinition(productIdentifier: string, taskDefinition: TaskDefinition): Observable<void>{
    return this.http.put(`${this.baseUrl}/products/${productIdentifier}/tasks/${taskDefinition.identifier}`, taskDefinition)
  }

  deleteTaskDefinition(productIdentifier: string, taskDefinitionIdentifier: string): Observable<void>{
    return this.http.delete(`${this.baseUrl}/products/${productIdentifier}/tasks/${taskDefinitionIdentifier}`)
  }

  findAllChargeDefinitionsForProduct(identifier: string): Observable<ChargeDefinition[]>{
    return this.http.get(`${this.baseUrl}/products/${identifier}/charges/`)
  }

  createChargeDefinition(productIdentifier: string, chargeDefinition: ChargeDefinition): Observable<void>{
    return this.http.post(`${this.baseUrl}/products/${productIdentifier}/charges/`, chargeDefinition)
  }

  getChargeDefinition(productIdentifier: string, chargeDefinitionIdentifier: string): Observable<ChargeDefinition>{
    return this.http.get(`${this.baseUrl}/products/${productIdentifier}/charges/${chargeDefinitionIdentifier}`)
  }

  changeChargeDefinition(productIdentifier: string, chargeDefinition: ChargeDefinition): Observable<void>{
    return this.http.put(`${this.baseUrl}/products/${productIdentifier}/charges/${chargeDefinition.identifier}`, chargeDefinition)
  }

  deleteChargeDefinition(productIdentifier: string, chargeDefinitionIdentifier: string): Observable<void>{
    return this.http.delete(`${this.baseUrl}/products/${productIdentifier}/charges/${chargeDefinitionIdentifier}`);
  }

  getAllCasesForProduct(productIdentifier: string, fetchRequest?: FetchRequest, includeClosed?: boolean): Observable<FimsCasePage>{
    const params: URLSearchParams = buildSearchParams(fetchRequest);

    params.append('includeClosed', includeClosed ? 'true' : 'false');
    params.append('pageIndex', "1");
    params.append('size', "10");

    const requestOptions: RequestOptionsArgs = {
      search: params
    };

    return this.http.get(`${this.baseUrl}/products/${productIdentifier}/cases/`, requestOptions)
      .map((casePage: CasePage) => mapToFimsCasePage(casePage))
  }

  createCase(productIdentifier: string, fimsCase: FimsCase): Observable<void> {
    const caseInstance: Case = mapToCase(fimsCase);

    return this.http.post(`${this.baseUrl}/products/${productIdentifier}/cases/`, caseInstance)
  }

  getCase(productIdentifier: string, caseIdentifier: string): Observable<FimsCase>{
    return this.http.get(`${this.baseUrl}/products/${productIdentifier}/cases/${caseIdentifier}`)
      .map((caseInstance: Case) => mapToFimsCase(caseInstance));
  }

  changeCase(productIdentifier: string, fimsCase: FimsCase): Observable<void> {
    const caseInstance: Case = mapToCase(fimsCase);
    return this.http.put(`${this.baseUrl}/products/${productIdentifier}/cases/${caseInstance.identifier}`, caseInstance)
  }

  getAllActionsForCase(productIdentifier: string, caseIdentifier: string): Observable<WorkflowAction[]>{
    return this.http.get(`${this.baseUrl}/products/${productIdentifier}/cases/${caseIdentifier}/actions/`)
  }

  getCostComponentsForAction(productIdentifier: string, caseIdentifier: string, action: string): Observable<CostComponent[]> {
    return this.http.get(`${this.baseUrl}/products/${productIdentifier}/cases/${caseIdentifier}/actions/${action}/costcomponents`)
  }

  executeCaseCommand(productIdentifier: string, caseIdentifier: string, action: string, command: CaseCommand): Observable<void>{
    return this.http.post(`${this.baseUrl}/products/${productIdentifier}/cases/${caseIdentifier}/commands/${action}`, command)
  }

  findAllTasksForCase(productIdentifier: string, caseIdentifier: string, includeExcluded?: boolean): Observable<TaskInstance[]> {
    const params: URLSearchParams = new URLSearchParams();

    params.append("includeExecuted", String(includeExcluded));

    const requestOptions: RequestOptionsArgs = {
      search: params
    };

    return this.http.get(`${this.baseUrl}/products/${productIdentifier}/cases/${caseIdentifier}/tasks/`, requestOptions)
  }

  getTaskForCase(productIdentifier: string, caseIdentifier: string, taskIdentifier: string): Observable<TaskInstance> {
    return this.http.get(`${this.baseUrl}/products/${productIdentifier}/cases/${caseIdentifier}/tasks/${taskIdentifier}`)
  }

  taskForCaseExecuted(productIdentifier: string, caseIdentifier: string, taskIdentifier: string, executed: boolean): Observable<void>{
    return this.http.put(`${this.baseUrl}/products/${productIdentifier}/cases/${caseIdentifier}/tasks/${taskIdentifier}/executed`, executed)
  }

  findAllCases(fetchRequest?: FetchRequest): Observable<FimsCase[]> {
    const search: URLSearchParams = buildSearchParams(fetchRequest);

    const requestOptions: RequestOptionsArgs = {
      search
    };

    return this.http.get(`${this.baseUrl}/cases/`, requestOptions)
      .map((caseInstances: Case[]) => mapToFimsCases(caseInstances))
  }

  getPaymentScheduleForCase(productIdentifier: string, caseIdentifier: string, initialDisbursalDate?: string): Observable<PlannedPaymentPage>{
    let params: URLSearchParams = new URLSearchParams();
    params.append('initialDisbursalDate', initialDisbursalDate ? new Date(initialDisbursalDate).toISOString() : undefined);

    let requestOptions: RequestOptionsArgs = {
      search: params
    };

    return this.http.get(`${this.baseUrl}/individuallending/products/${productIdentifier}/cases/${caseIdentifier}/plannedpayments`, requestOptions)
  }

  getAllCasesForCustomer(customerIdentifier: string, fetchRequest?: FetchRequest): Observable<FimsCasePage>{
    const search: URLSearchParams = buildSearchParams(fetchRequest);

    const requestOptions: RequestOptionsArgs = {
      search
    };

    return this.http.get(`${this.baseUrl}/individuallending/customers/${customerIdentifier}/cases`, requestOptions)
      .map((casePage: CasePage) => mapToFimsCasePage(casePage));
  }

  updateStoreProducts(id, rev, data, elements, pages){
    this.Store.update({
      "_id": "product_doc",
      "_rev": rev,
      "data": {
        "elements": data,
        "totalElements": elements,
        "totalPages": pages
      }
    });
  }

}
