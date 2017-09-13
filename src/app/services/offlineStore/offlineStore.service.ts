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
import * as PouchDB from 'pouchdb/dist/pouchdb';

@Injectable()
export class OfflineStoreService implements OnInit {

    private localPouchDb: any;

    //constructor(name, remote, onChange, @Inject('remoteCouchDbUrl') private couchDbUrl: string) {
    constructor(@Inject('remoteCouchDbUrl') private couchDbUrl: string) {
        PouchDB.debug.enable('*');
        this.localPouchDb = new PouchDB(this.couchDbUrl + "employee_database", 
            {
                auth: {
                    username: 'admin',
                    password: 'admin'
                }
            }
        );
    }
    
    ngOnInit() {}

    authenticateUser(username, password, tenant) {
        // var user = {
        //     "_id": "users",
        //     "username": username,
        //     "password": password,
        //     "tenant": tenant
        // }
        // // add or update user document
        // this.save(user);
    }

    getAll() {
        return this.localPouchDb.allDocs({ include_docs: true })
            .then(localPouchDb => {
                return localPouchDb.rows.map(row => {
                    return row.doc;
                });
            });
    }

    get(id: string) {
        return this.localPouchDb.get(id);
    }

    save(item) {
        return item._id
            ? this.update(item)
            : this.add(item);
    }

    add(item) {
        return this.localPouchDb.put(item);
    }

    update(item) {
        return this.localPouchDb.get(item._id)
            .then(updatingItem => {
                Object.assign(updatingItem, item);
                return this.localPouchDb.put(updatingItem);
            });
    }
}
