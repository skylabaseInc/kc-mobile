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
import {Observable} from 'rxjs/Observable';
import {ProductDefinition} from './domain/definition/product-definition.model';
import {ProductDefinitionCommand} from './domain/definition/product-definition-command.model';
import {ProductInstance} from './domain/instance/product-instance.model';
import {RequestOptionsArgs, URLSearchParams} from '@angular/http';
import {Action} from './domain/definition/action.model';
import {DividendDistribution} from './domain/definition/dividend-distribution.model';
import {OfflineStoreService} from '../offlineStore/offlineStore.service';

@Injectable()
export class DepositAccountService {

  private definition: ProductDefinition;

  constructor(private http: HttpClient, @Inject('depositAccountBaseUrl') private baseUrl: string, private Store: OfflineStoreService) {}

  createProductDefinition(productDefinition: ProductDefinition): Observable<void> {
   
    return Observable.fromPromise<void>(this.Store.getUpdate('def_doc').then(row => {
      var elements = row.data;
      this.updateStoreDefinitions('def_doc', row._rev, elements);
    }))
  }

  updateProductDefinition(productDefinition: ProductDefinition): Observable<void> {
    return Observable.fromPromise<void>(this.Store.getUpdate('def_doc').then(row => {
      var index = row.data.findIndex(element => element.identifier == productDefinition.identifier);

      var removedItem = row.data.splice(index, 1);
      row.data.splice(index, 0, productDefinition);

      this.updateStoreDefinitions('def_doc', row._rev, row.data);
    }))
  }

  deleteProductDefinition(identifier: string): Observable<void> {

    return Observable.fromPromise<void>(this.Store.getUpdate('def_doc').then(row => {
      var index = row.data.findIndex(element => element.identifier == identifier);
      var removedItem = row.data.splice(index, 1);

      this.updateStoreDefinitions('def_doc', row._rev, row.data);
    }))
  }

  fetchProductDefinitions(): Observable<ProductDefinition[]> {

    return Observable.fromPromise<ProductDefinition[]>(this.Store.get('def_doc'))
      .map(data => data);
  }

  findProductDefinition(identifier: string): Observable<ProductDefinition> {
    
    return Observable.fromPromise<ProductDefinition>(this.Store.getUpdate('def_doc').then(row => {
      this.definition = row.data.filter(element => element.identifier == identifier);
    }))
    .map(definition => this.definition[0]);
  }

  processCommand(identifier: string, command: ProductDefinitionCommand): Observable<void> {
    return this.http.post(`${this.baseUrl}/definitions/${identifier}/commands`, command);
  }

  fetchDividendDistributions(identifier: string): Observable<DividendDistribution[]> {
    return this.http.get(`${this.baseUrl}/definitions/${identifier}/dividends`)
  }

  distributeDividend(identifier: string, dividendDistribution: DividendDistribution): Observable<void> {
    return this.http.post(`${this.baseUrl}/definitions/${identifier}/dividends`, dividendDistribution)
  }

  createProductInstance(productInstance: ProductInstance): Observable<void> {
    return this.http.post(`${this.baseUrl}/instances`, productInstance);
  }

  updateProductInstance(productInstance: ProductInstance): Observable<void> {
    return this.http.put(`${this.baseUrl}/instances/${productInstance.accountIdentifier}`, productInstance);
  }

  findProductInstance(identifier: string): Observable<ProductInstance> {
    return this.http.get(`${this.baseUrl}/instances/${identifier}`);
  }

  fetchProductInstances(customerIdentifier: string, productIdentifier?: string): Observable<ProductInstance[]> {
    let params = new URLSearchParams();

    params.append('customer', customerIdentifier);
    params.append('product', productIdentifier);

    let requestOptions: RequestOptionsArgs = {
      search: params
    };

    return this.http.get(`${this.baseUrl}/instances`, requestOptions);
  }

  fetchActions(): Observable<Action[]> {
    return Observable.fromPromise<Action[]>(this.Store.get('actions_doc'))
    .map(data => data)
  }

  updateStoreDefinitions(id, rev, data) {
    this.Store.update({
      "_id": "def_doc",
      "_rev": rev,
      "data": data
    });
  }


}
