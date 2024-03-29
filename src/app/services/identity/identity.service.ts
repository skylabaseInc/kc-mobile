import { PermittableGroupIdMapper } from '../security/authz/permittable-group-id-mapper';
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
import {Observable} from 'rxjs';
import {Error} from '../domain/error.model';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {HttpClient} from '../http/http.service';
import {Password} from './domain/password.model';
import {UserWithPassword} from './domain/user-with-password.model';
import {Role} from './domain/role.model';
import {RoleIdentifier} from './domain/role-identifier.model';
import {User} from './domain/user.model';
import {PermittableGroup} from '../anubis/permittable-group.model';
import {Permission} from './domain/permission.model';
import {OfflineStoreService} from '../offlineStore/offlineStore.service';

@Injectable()
export class IdentityService {

  private role: Role;
  private permittableGroup: PermittableGroup;
  private user: User;

  constructor(private http: HttpClient, @Inject('identityBaseUrl') private baseUrl: string, private Store: OfflineStoreService) {}

  private static encodePassword(password: string): string{
    return btoa(password);
  }

  changePassword(id: string, password: Password): Observable<any> {
    password.password = IdentityService.encodePassword(password.password);

    return Observable.fromPromise<any>(this.Store.getUpdate('usersTest_doc').then(row => {
      var user = row.data.users.filter(element => element.identifier == id);
      user.password = password.password;
      var index = row.data.user.findIndex(element => element.identifier == id);
      var removedItems = row.data.user.splice(index, 1);
      row.data.users.splice(index, 0, user);

      this.updataStoreUsers('usersTest_doc', row._rev, row.data.users, row.data.totalElements, row.data.totalPages);
    }))
    .catch(Error.handleError);
  }

  createUser(user: UserWithPassword): Observable<any> {
    user.password = IdentityService.encodePassword(user.password);
    return Observable.fromPromise<any>(this.Store.getUpdate('usersTest_doc').then(row => {
      var elements = row.data.users.push(user);
      this.updataStoreUsers('usersTest_doc', row._rev, row.data.users, elements, row.data.totalPages);
    }))
  }

  getUser(id: string): Observable<User> {
    return Observable.fromPromise<User>(this.Store.getUpdate('usersTest_doc').then(row => {
      var user = row.data.users.filter(element => element.identifier == id);
      this.user = user;
    }))
    .map(user => this.user[0])
    .catch(Error.handleError);
  }

  changeUserRole(user: string, roleIdentifier: RoleIdentifier): Observable<any>{
    return this.http.put(this.baseUrl + '/users/' + user + '/roleIdentifier', roleIdentifier)
      .catch(Error.handleError);
  }

  listRoles(): Observable<Role[]> {
    return Observable.fromPromise<Role[]>(this.Store.get('roles_doc'))
      .map(data => data);
  }

  getRole(id: string): Observable<Role> {
    return Observable.fromPromise<Role>(this.Store.getUpdate('roles_doc').then(row => {
      this.role = row.data.filter(element => element.identifier == id);
    }))
    .map(role => this.role[0]);
  }

  createRole(role: Role): Observable<any> {
    return Observable.fromPromise<any>(this.Store.getUpdate('roles_doc').then(row => {
      var elements = row.data.push(role);
      this.updateStoreRoles('roles_doc', row._rev, row.data)
    }))
  }

  changeRole(role: Role): Observable<any> {
    return Observable.fromPromise<any>(this.Store.getUpdate('roles_doc').then(row => {
      var index = row.data.findIndex(element => element.identifier == role.identifier);
      row.data.splice(index, 1);
      row.data.splice(index, 0, role);

      this.updateStoreRoles('roles_doc', row._rev, row.data);
    }))
  }

  deleteRole(id: String): Observable<any> {
    return Observable.fromPromise<any>(this.Store.getUpdate('roles_doc').then(row => {
      var index = row.data.findIndex(element => element.identifier == id);
      row.data.splice(index, 1);

      this.updateStoreRoles('roles_doc', row._rev, row.data);
    }))
  }

  createPermittableGroup(permittableGroup: PermittableGroup): Observable<PermittableGroup>{
    return Observable.fromPromise<PermittableGroup>(this.Store.getUpdate('permittablegroups_doc').then(row => {
      var elements = row.data.push(permittableGroup);

      this.updateStorePermittableGroups('permittablegroups_doc', row._rev, row.data);
    }))
  }

  getPermittableGroup(id: string): Observable<PermittableGroup>{
    return Observable.fromPromise<PermittableGroup>(this.Store.getUpdate('permittablegroups_doc').then(row => {
      this.permittableGroup = row.data.filter(element => element.identifier == id);
    }))
    .map(permittableGroup => this.permittableGroup[0]);
  }

  getPermittableGroups(): Observable<PermittableGroup[]>{
    return Observable.fromPromise<PermittableGroup[]>(this.Store.get('permittablegroups_doc'))
      .map(data => data);
  }

  updateStoreRoles(id, rev, data) {
    this.Store.update({
      "_id": "roles_doc",
      "_rev": rev,
      "data": data
    });
  }

  updateStorePermittableGroups(id, rev, data) {
    this.Store.update({
      "_id": "permittablegroups_doc",
      "_rev": rev,
      "data": data
    })
  }

  updataStoreUsers(id, rev, data, elements, pages) {
    this.Store.update({
      "_id": "usersTest_doc",
      "_rev": rev,
      "data": {
        "users": data, 
        "totalElements": elements, 
        "totalPages": pages
      }
    })
  }
}
