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

import { Injectable, OnInit } from '@angular/core';
import {DevService} from '../../services/dev_logger/dev.service';
import * as PouchDB from 'pouchdb/dist/pouchdb';

@Injectable()
export class OfflineStoreService implements OnInit {

    private db: any;

    constructor(private consoleLogger: DevService) {

        // enable debugging
        PouchDB.debug.enable('*');

        // Initialize PouchDB database
        this.db = new PouchDB("kuelap-mobile-test");
    }

    ngOnInit(): void {
        this.getAllData();
    }

    // get all Data
    getAllData() {
        return this.db.allDocs({
            include_docs: true
        })
        .then(db => {
            return db.rows.map(row => {
                this.consoleLogger.consoleAny("Data gotten: " + row.doc);
                return row.doc;
            });
        });
    }

    get(id) {
        return this.db.get(id);
    }

    save(item) {
        return item._id ? this.update(item) : this.add(item);
    }

    add(item) {
        return this.db.post(item);
    }

    update(item) {
        return this.db.get(item._id)
            .then(updatingItem => {
                Object.assign(updatingItem, item);
                return this.db.put(updatingItem);
            });
    }

    remove(id) {
        return this.db.get(id)
            .then(item => {
                return this.db.remove(item);
            });
    }
}
