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
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';
import {Http, RequestOptionsArgs, Headers, Response} from '@angular/http';
import {Error} from '../../domain/error.model';
import {Authentication} from '../../identity/domain/authentication.model';
import {Permission} from '../../identity/domain/permission.model';
import {OfflineStoreService} from '../../offlineStore/offlineStore.service'

@Injectable()
export class AuthenticationService {

  exists: boolean;
  encodedPassword: string;

  constructor(@Inject('identityBaseUrl') private identityBaseUrl: string, private http: Http, private Store: OfflineStoreService) {}

  private static encodePassword(password: string): string{
    return btoa(password);
  }

  login(tenantId: string, userId: string, password: string): Observable<Authentication> {
    this.encodedPassword = AuthenticationService.encodePassword(password);

    const resp = this.Store.checkUser(userId).then(exists => {
      return exists;
    }).then(exists => {
        if(exists) {
            return this.Store.getUpdate("users_doc").then(row => {
            let user = row.data.users.filter(usr => usr.identifier == userId);
            if(user[0].password == this.encodedPassword) {
              return {
                tokenType: "bearer",
                accessToken: this.getAccessToken(),
                accessTokenExpiration: this.getExpirationDates(),
                refreshTokenExpiration: "2018-10-05T05:34:14.706Z",
                passwordExpiration: this.getExpirationDates()
              };
          }
        })
      } else {
        // TODO: Create user here in pouchdb database
        // .. this is just a workaround until the sync gateway is ready
        return this.loginOnline(tenantId, userId, password).toPromise();
      }
    })
    return Observable.fromPromise(resp);
  }

  loginOnline(tenantId: string, userId: string, password: string): Observable<Authentication> {
    let loginUrl: string = '/token?grant_type=password&username=';
    return this.http.post(this.identityBaseUrl + loginUrl + userId + '&password=' + this.encodedPassword, {}, this.tenantHeader(tenantId))
      .map((response: Response) => this.mapResponse(response))
      .catch(Error.handleError);
  }

  logout(tenantId: string, userId: string, accessToken: string): Observable<Response> {
    return this.http.delete(this.identityBaseUrl + '/token/_current', this.authorizationHeader(tenantId, userId, accessToken))
      .map((response: Response) => this.mapResponse(response))
      .catch(Error.handleError);
  }

  getUserPermissions(tenantId: string, userId: string, accessToken: string): Observable<Permission[]>{
    // return this.http.get(this.identityBaseUrl + '/users/' + userId + '/permissions', this.authorizationHeader(tenantId, userId, accessToken))
    //   .map((response: Response) => this.mapResponse(response))
    //   .catch(Error.handleError)

    // TODO: Actually get this and save if user does not exist in the offline database
    return Observable.fromPromise<Permission[]>(this.Store.get('man_doc').then(row => {
      return row;
    }))
  }

  refreshAccessToken(tenantId: string): Observable<Authentication> {
    let refreshTokenUrl = '/token?grant_type=refresh_token';
    return this.http.post(this.identityBaseUrl + refreshTokenUrl, {}, this.tenantHeader(tenantId))
      .map((response: Response): Authentication => this.mapResponse(response))
      .catch(Error.handleError);
  }

  private mapResponse(response: Response): any{
    if(response.text()){
      return response.json();
    }
  }

  private authorizationHeader(tenantId: string, userId: string, accessToken: string): RequestOptionsArgs{
    let requestOptions: RequestOptionsArgs = this.tenantHeader(tenantId);

    requestOptions.headers.set('User', userId);
    requestOptions.headers.set('Authorization', accessToken);

    return requestOptions;
  }

  private tenantHeader(tenantId: string): RequestOptionsArgs{
    let headers: Headers = new Headers();
    headers.set('X-Tenant-Identifier', tenantId);

    return {
      headers: headers
    };
  }

  private getExpirationDates() {
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth();
    var day = d.getDate();
    var c = new Date(year + 1, month, day);
    return c.toLocaleString();
  }

  private getAccessToken() {
    return "Bearer eyJhbGciOiJSUzUxMiJ9.eyJzdWIiOiJQbGF5IiwiL21pZm9zLmlvL3NpZ25hdHVyZVRpbWVzdGFtcCI6IjIwMTctMTAtMDRUMTJfNDdfMDYiLCIvbWlmb3MuaW8vdG9rZW5Db250ZW50Ijoie1widG9rZW5QZXJtaXNzaW9uc1wiOlt7XCJwYXRoXCI6XCJhY2NvdW50aW5nLXYxL2FjY291bnRzLyovY29tbWFuZHNcIixcImFsbG93ZWRPcGVyYXRpb25zXCI6W1wiQ0hBTkdFXCIsXCJSRUFEXCJdfSx7XCJwYXRoXCI6XCJkZXBvc2l0LXYxL2luc3RhbmNlcy8qXCIsXCJhbGxvd2VkT3BlcmF0aW9uc1wiOltcIkNIQU5HRVwiLFwiUkVBRFwiXX0se1wicGF0aFwiOlwiY3VzdG9tZXItdjEvY3VzdG9tZXJzLyovaWRlbnRpZmljYXRpb25zLyovc2NhbnMvKlwiLFwiYWxsb3dlZE9wZXJhdGlvbnNcIjpbXCJERUxFVEVcIixcIlJFQURcIl19LHtcInBhdGhcIjpcInBvcnRmb2xpby12MS9wcm9kdWN0cy8qL2Nhc2VzLyovdGFza3MvKi9leGVjdXRlZFwiLFwiYWxsb3dlZE9wZXJhdGlvbnNcIjpbXCJDSEFOR0VcIl19";
  }

}
