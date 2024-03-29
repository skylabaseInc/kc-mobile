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
    private authDb: any;
    private data: any;

    constructor(@Inject('remoteCouchDbUrl') private couchDbUrl: string) {
        PouchDB.debug.enable('*');
        this.localDb = new PouchDB('kuelap-mobile');
        this.authDb = new PouchDB('kuelap-auth');
        this.remoteDb = new PouchDB(this.couchDbUrl + "kuelap_io", 
            {
                auth: {
                    username: 'admin',
                    password: '@@Admin2017'
                }
            }
        );

        let options = {
            live: true,
            retry: true,
            continuous: true
        };

        // Synchronization mechanism
        this.localDb.sync(this.remoteDb, options).on('complete', () => {}).on('error', err => {});
    }
    
    ngOnInit() {}

    getAll() {
        return this.remoteDb.allDocs({ include_docs: true })
            .then(localDb => {
                return localDb.rows.map(row => {
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

    // Custom method to check for user existence
    // ... part of the workaround to make up for the sync gateway
    checkUser(userId: string, document = 'users_doc'){
        return this.localDb.get(document).then(row => {
            let user = row.data.users.filter(element => element.identifier == userId);
            if(user.length) {
                return true;
            }
            return false;
        })
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
                return this.localDb.put(updatingItem).then(response => {
                    console.info("[POUCHDB-DEV] Update successful with response: " + response);
                });
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