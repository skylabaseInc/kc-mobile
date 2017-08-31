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

    private remoteCouchDb: any;
    private testDb: any;

    // constructor(name, remote, onChange, @Inject('remoteCouchDbUrl') private couchDbUrl: string) {
    constructor(@Inject('remoteCouchDbUrl') private couchDbUrl: string) {

        // enable debugging
        PouchDB.debug.enable('*');
        // this.remoteCouchDb = new PouchDB("kuelap-mobile-test");

        // // start sync in pull mode
        // PouchDB.sync(name, `${remote}/${name}`, {
        //     live: true,
        //     retry: true
        // }).on('change', info => {
        //     onChange(info);
        // });
        this.connectToCouchDbOnline();
        this.getAll();
        this.get("offices");
    }
    
    ngOnInit() {}

    connectToCouchDbOnline(): void {
        this.remoteCouchDb = new PouchDB(this.couchDbUrl + 'playground', {
            auth: {
                username: 'admin',
                password: 'admin'
            }
        });
    }

    // method to handle authentication
    authenticateUser(username, password, tenant) {
        var user = {
            "_id": "users",
            "username": username,
            "password": password,
            "tenant": tenant
        }
        // add or update user document
        this.add(user);
    }

    // CRUD methods
    getAll() {
        return this.remoteCouchDb.allDocs({ include_docs: true })
            .then(remoteCouchDbdb => {
                return remoteCouchDbdb.rows.map(row => {
                    console.log(row.doc);
                    return row.doc;
                });
            });
    }

    get(id) {
        // return this.remoteCouchDb.get(id);
        this.remoteCouchDb.get(id).then(item => {
            return item;
        })
    }

    save(item) {
        return item._id
            ? this.update(item)
            : this.add(item);
    }

    // add new item
    add(item) {
        return this.remoteCouchDb.post(item);
    }

    // update item
    update(item) {
        return this.remoteCouchDb.get(item._id)
            .then(updatingItem => {
                Object.assign(updatingItem, item);
                return this.remoteCouchDb.put(updatingItem);
            });
    }

    // find item by id
    remove(id) {
        return this.remoteCouchDb.get(id)
            .then(item => {
                return this.remoteCouchDb.remove(item);
            });
    }
}
