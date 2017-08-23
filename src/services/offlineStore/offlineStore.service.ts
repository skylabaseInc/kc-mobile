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

import {Inject, Injectable, OnInit} from '@angular/core';
import {DevService} from '../../services/dev_logger/dev.service';
import * as PouchDB from 'pouchdb/dist/pouchdb';
import {LoginComponent} from "../../app/login/login.component";

@Injectable()
export class OfflineStoreService implements OnInit {

  private db: any;
  private remoteCouchDb: any;

  constructor(private consoleLogger: DevService, @Inject('remoteCouchDbUrl') private couchDbUrl: string) {

    // enable debugging
    PouchDB.debug.enable('*');
    this.db = new PouchDB("kuelap-mobile-test");

    this.db.info().then(function (info) {
      consoleLogger.consoleLog(info);
    });
    this.connectToCouchDbOnline();
  }

  ngOnInit(): void {
    // this.getAllData();
    var doc = {
      "_id": "test_pouch",
      "name": "PouchTest",
      "occupation": "Developer"
    };
    this.db.put(doc);
  }

  connectToCouchDbOnline(): void {
    this.remoteCouchDb = new PouchDB(this.couchDbUrl + 'playground',
      {
        auth: {
          username: 'admin',
          password: 'admin'
        }
      }
    );
    this.remoteCouchDb.info().then(function (info) {
      console.log(info);

    })
  }

  // Initializers
  intializeCustomers(): void {
    var customer = {}

    this.db.put(customer);
  }

  getAllData(): void {
    this.getCustomerData();
    this.getOfficeData();
    this.getLoanProductData();
    this.getDepositProductData();
    this.getLoanAccountTransactionData();
    this.getDepositAccountTransactionData();
  }

  getCustomerData(): void {
    this.db.get('customers').then(function (customers) {
      // code here ...
    })
  }

  getOfficeData(): void {
    this.db.get('office').then(function (office) {
      // code here ...
    })
  }

  getLoanProductData(): void {

  }

  getDepositProductData(): void {

  }

  getLoanAccountTransactionData(): void {

  }

  getDepositAccountTransactionData(): void {

  }
}
