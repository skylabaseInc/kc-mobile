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
import {HttpClient} from '../http/http.service';
import {Ledger} from './domain/ledger.model';
import {Observable} from 'rxjs';
import {Account} from './domain/account.model';
import {RequestOptionsArgs, URLSearchParams} from '@angular/http';
import {AccountCommand} from './domain/account-command.model';
import {JournalEntry} from './domain/journal-entry.model';
import {TrialBalance} from './domain/trial-balance.model';
import {AccountEntryPage} from './domain/account-entry-page.model';
import {AccountPage} from './domain/account-page.model';
import {FetchRequest} from '../domain/paging/fetch-request.model';
import {buildSearchParams, buildDateRangeParam} from '../domain/paging/search-param.builder';
import {LedgerPage} from './domain/ledger-page.model';
import {ChartOfAccountEntry} from './domain/chart-of-account-entry.model';
import {TransactionType} from './domain/transaction-type.model';
import {TransactionTypePage} from './domain/transaction-type-page.model';
import {AccountType} from './domain/account-type.model';
import {OfflineStoreService} from '../offlineStore/offlineStore.service';

@Injectable()
export class AccountingService{

  private ledger: Ledger;
  private transactionType: Account;

  constructor(private http: HttpClient, @Inject('accountingBaseUrl') private baseUrl: string, private Store: OfflineStoreService) {}

  public createLedger(ledger: Ledger): Observable<void>{
    return Observable.fromPromise<void>(this.Store.getUpdate('ledgers_doc').then(row => {
      var elements = row.data.ledgers.push(ledger);
      this.updateStoreLedgers('ledgers_doc', row._rev, elements, row.data.totalElements, row.data.totalPages);
    }))
  }

  public fetchLedgers(includeSubLedgers = false, fetchRequest?: FetchRequest, type?: AccountType): Observable<LedgerPage>{
    const params: URLSearchParams = buildSearchParams(fetchRequest);

    params.append('includeSubLedgers', String(includeSubLedgers));
    params.append('type', type);

    const requestOptions: RequestOptionsArgs = {
      params
    };
    
    return Observable.fromPromise<LedgerPage>(this.Store.get('ledgers_doc'))
        .map(data => data);
  }

  public findLedger(identifier: string, silent?: boolean): Observable<Ledger>{
    return Observable.fromPromise<Ledger>(this.Store.getUpdate('ledgers_doc').then(row => {
      var ledger = row.data.ledgers.filter(element => element.identifier == identifier)
      this.ledger = ledger;
    }))
    .map(ledger => this.ledger[0]);
  }

  public addSubLedger(identifier: string, subLedger: Ledger): Observable<void>{
    return this.http.post(`${this.baseUrl}/ledgers/${identifier}`, subLedger);
  }

  public modifyLedger(ledger: Ledger): Observable<void>{
    return Observable.fromPromise<void>(this.Store.getUpdate('ledgers_doc').then(row => {
      var index = row.data.ledgers.findIndex(element => element.identifier == ledger.identifier);
      var removedItem = row.data.ledgers.splice(index, 1);
      row.data.ledgers.splice(index, 0, ledger);

      this.updateStoreLedgers('ledgers_doc', row._rev, row.data.ledgers, row.data.totalElements, row.data.totalPages);
    }))
  }

  public deleteLedger(identifier: string): Observable<void>{
    return Observable.fromPromise<void>(this.Store.getUpdate('ledgers_doc').then(row => {
      var index = row.data.ledgers.findIndex(element => element.identifier == identifier);
      var removedItems = row.data.ledgers.splice(index, 1);

      this.updateStoreLedgers('ledgers_doc', row._rev, row.data.ledgers, row.data.totalElements, row.data.totalPages);
    }))
  }

  public fetchAccountsOfLedger(identifier: string, fetchRequest?: FetchRequest): Observable<AccountPage>{
    let params: URLSearchParams = buildSearchParams(fetchRequest);

    let requestOptions: RequestOptionsArgs = {
      params
    };
    return this.http.get(`${this.baseUrl}/ledgers/${identifier}/accounts`, requestOptions);
  }

  public createAccount(account: Account): Observable<void>{
    return this.http.post(`${this.baseUrl}/accounts`, account);
  }

  public fetchAccounts(fetchRequest?: FetchRequest, type?: AccountType): Observable<AccountPage>{
    const params: URLSearchParams = buildSearchParams(fetchRequest);

    params.append('type', type);

    const requestOptions: RequestOptionsArgs = {
      params
    };
    return this.http.get(`${this.baseUrl}/accounts`, requestOptions)
      .share();
  }

  public findAccount(identifier: string, silent?: boolean): Observable<Account>{
    return this.http.get(`${this.baseUrl}/accounts/${identifier}`, {}, silent);
  }

  public modifyAccount(account: Account): Observable<void>{
    return this.http.put(`${this.baseUrl}/accounts/${account.identifier}`, account);
  }

  public deleteAccount(account: Account): Observable<void>{
    return this.http.delete(`${this.baseUrl}/accounts/${account.identifier}`)
  }

  public fetchAccountEntries(identifier: string, startDate: string, endDate: string, fetchRequest?: FetchRequest): Observable<AccountEntryPage>{
    let params: URLSearchParams = buildSearchParams(fetchRequest);
    let dateRange = buildDateRangeParam(startDate, endDate);
    params.append('dateRange', dateRange);

    let requestOptions: RequestOptionsArgs = {
      params
    };
    return this.http.get(`${this.baseUrl}/accounts/${identifier}/entries`, requestOptions);
  }

  public fetchAccountCommands(identifier: string): Observable<AccountCommand[]>{
    return this.http.get(`${this.baseUrl}/accounts/${identifier}/commands`);
  }

  public accountCommand(identifier: string, command: AccountCommand): Observable<void>{
    return this.http.post(`${this.baseUrl}/accounts/${identifier}/commands`, command);
  }

  public createJournalEntry(journalEntry: JournalEntry): Observable<void>{
    return this.http.post(`${this.baseUrl}/journal`, journalEntry);
  }

  public fetchJournalEntries(startDate: string, endDate: string): Observable<JournalEntry[]>{
    let params: URLSearchParams = new URLSearchParams();
    params.append('dateRange', buildDateRangeParam(startDate, endDate));

    let requestOptions: RequestOptionsArgs = {
      params
    };
    return this.http.get(`${this.baseUrl}/journal`, requestOptions)
  }

  public findJournalEntry(transactionIdentifier: string): Observable<JournalEntry>{
    return this.http.get(`${this.baseUrl}/journal/${transactionIdentifier}`)
  }

  public getTrialBalance(includeEmptyEntries?: boolean): Observable<TrialBalance>{
    let params: URLSearchParams = new URLSearchParams();
    params.append('includeEmptyEntries', includeEmptyEntries ? 'true' : 'false');

    let requestOptions: RequestOptionsArgs = {
      params
    };
    return this.http.get(`${this.baseUrl}/trialbalance`, requestOptions)
  }

  public getChartOfAccounts(): Observable<ChartOfAccountEntry[]> {
    return Observable.fromPromise<ChartOfAccountEntry[]>(this.Store.get('chartofaccounts_doc'))
      .map(data => data);
  }

  public findTransactionType(code: string): Observable<Account>{
    return Observable.fromPromise<Account>(this.Store.getUpdate('transactionTypes_doc').then(row => {
      var transaction_type = row.data.transactionTypes.filter(element => element.code == code);
      this.transactionType = transaction_type
    }))
    .map(transactionType => this.transactionType[0])
    .do(transactionType => console.log("[DATA]: ", transactionType));
  }

  public createTransactionType(transactionType: TransactionType): Observable<void> {
    return Observable.fromPromise<void>(this.Store.getUpdate('transactionTypes_doc').then(row => {
      var elements = row.data.transactionTypes.push(transactionType);
      this.updateStoreTransactionTypes('transactionTypes_doc', row._rev, elements, row.data.totalElements, row.data.totalPages);
    }))
  }

  public fetchTransactionTypes(fetchRequest?: FetchRequest): Observable<TransactionTypePage> {
    let params: URLSearchParams = buildSearchParams(fetchRequest);

    let requestOptions: RequestOptionsArgs = {
      params
    };

    return Observable.fromPromise<TransactionTypePage>(this.Store.get('transactionTypes_doc'))
      .map(data => data);
  }

  public changeTransactionType(transactionType: TransactionType): Observable<void> {
    return Observable.fromPromise<void>(this.Store.getUpdate('transactionTypes_doc').then(row => {
      var index = row.data.transactionTypes.findIndex(element => element.code == transactionType.code);
      row.data.transactionTypes.splice(index, 1);
      row.data.transactionTypes.splice(index, 0, transactionType);

      this.updateStoreTransactionTypes('transactionTypes_doc', row._rev, row.data.transactionTypes, row.data.totalElements, row.data.totalPages);
    }))
  }

  updateStoreLedgers(id, rev, data, elements, pages) {
    this.Store.update({
      "_id": id,
      "_rev": rev,
      "data": {
        "ledgers": data,
        "totalElements": elements,
        "totalPages": pages
      }
    });
  }

  updateStoreTransactionTypes(id, rev, data, elements, pages) {
    this.Store.update({
      "_id": id,
      "_rev": rev,
      "data": {
        "transactionTypes": data,
        "totalElements": elements,
        "totalPages": pages
      }
    });
  }
}
