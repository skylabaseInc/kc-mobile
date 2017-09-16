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

    private localDb: any;
    private remoteDb: any;
    private data: any;

    constructor(@Inject('remoteCouchDbUrl') private couchDbUrl: string) {
        PouchDB.debug.enable('*');
        this.localDb = new PouchDB('kuelap-mobile');

        this.remoteDb = new PouchDB(this.couchDbUrl + "employee_database", 
            {
                auth: {
                    username: 'admin',
                    password: 'admin'
                }
            }
        );

        let options = {
            live: true,
            retry: true,
            continuous: true
        };

        // Synchronization mechanism
        this.localDb.sync(this.remoteDb, options).on('complete', () => { 
            console.log("[POUCHDB] Completed replication")
        }).on('error', err => {
            console.error("[POUCHDB] Error in replication!!");
        });
    }
    
    ngOnInit() {}

    // TODO: handle offline authentication
    authenticateUser(username, password, tenant) {}

    getAll() {
        return this.remoteDb.allDocs({ include_docs: true })
            .then(localDb => {
                return localDb.rows.map(row => {
                    console.log(row.doc.data);
                    this.localDb.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
                        this.handleChange(change);
                    });
                    return row.doc.data;
                });
            });
    }

    get(id: string) {
        return this.localDb.get(id)
            .then(row => {
                return row.data;
            });
    }

    getUpdate(id: string) {
        return this.localDb.get(id)
            .then(row => {
                return row;
            });
    }

    add(item) {
        return this.localDb.put(item).then(response => {
            console.info("[POUCHDB-DEV] response: " + response);
        })
    }

    update(item) {
        return this.localDb.get(item._id)
            .then(updatingItem => {
                Object.assign(updatingItem, item);
                return this.localDb.put(updatingItem);
            });
    }

    save(item) {
        return item._id
            ? this.update(item)
            : this.add(item);
    }

    handleChange(change) {
        
        let changedDoc = null;
        let changedIndex = null;

        this.data.forEach((doc, index) => {
            if(doc._id === change.id) {
                changedDoc = doc;
                changedIndex = index;
            }
        });

        // A document was deleted
        if(change.deleted) {
            this.data.splice(changedIndex, 1);
        } else {
            // A document was updated
            if(changedDoc) {
                this.data[changedIndex] = change.doc;
            } else { // A document was added
                this.data.push(change.doc);
            }
        }
    }   
}