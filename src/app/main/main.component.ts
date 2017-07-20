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
import {Component, OnInit, AfterViewInit, HostListener} from '@angular/core';
import {Router, NavigationEnd, ActivatedRoute, RouterState} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {HttpClient, Action} from '../../services/http/http.service';
import {Store} from '@ngrx/store';
import * as fromRoot from '../reducers';
import {LOGOUT} from '../reducers/security/security.actions';
import {Observable} from 'rxjs/Observable';
import {DevService} from '../../services/dev_logger/dev.service';
import {OfflineStoreService} from '../../services/offlineStore/offlineStore.service';

@Component({
  selector: 'fims-main',
  templateUrl: './main.component.html'
})
export class MainComponent implements OnInit, AfterViewInit {

  icon: string;

  logo: string;

  isLoading$: Observable<boolean>;

  title: string;

  tenant$: Observable<string>;

  username$: Observable<string>;

  protected menuMode = "side";
  protected openMode;

  constructor(private router: Router, private titleService: Title, private httpClient: HttpClient, private store: Store<fromRoot.State>, private consoleLogService: DevService, private offlineStore: OfflineStoreService) { }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if(event instanceof NavigationEnd){
        let title = this.getTitle(this.router.routerState, this.router.routerState.root).join(" - ");
        this.titleService.setTitle(title);
        this.title = title;
      }
    });

    this.tenant$ = this.store.select(fromRoot.getTenant);
    this.username$ = this.store.select(fromRoot.getUsername);
    this.openMode = "true";

    this.offlineStore.ngOnInit();
  }

  ngAfterViewInit(): void {
    this.isLoading$ = this.httpClient.process
      .debounceTime(1000)
      .map((action: Action) => action === Action.QueryStart);
  }

  getTitle(state: RouterState, parent: ActivatedRoute){
    let data = [];

    if(parent && parent.snapshot.data){
      let dataProperty: any = parent.snapshot.data;

      if(dataProperty.title){
        data.push(dataProperty.title);
      }
    }

    if(state && parent){
      data.push(... this.getTitle(state, parent.firstChild));
    }

    return data;
  }

  logout(): void {
    this.store.dispatch({ type: LOGOUT });
  }

  goToSettings(): void {
    this.router.navigate(['/user']);
  }

  showSideNavOver(): void {
    this.menuMode = "over";
  }

  showSideNavSide(): void {
    this.menuMode = "side";
  }

  toggleSideBar(): void {
    switch(this.openMode) {
      case "false": {
        this.openMode = "true";
        break;
      }
      case "true": {
        this.openMode = "false";
        break;
      }
      default: {
        this.openMode = "true";
        break;
      }
    }
  }

  configureOpenMode(event: any) {
    if (event.target.innerWidth < 800) {
      this.showSideNavOver();
    } else if (event.target.innerWidth >= 800) {
      this.showSideNavSide();
    }
  }

  @HostListener('window:resize', ['$event'])
    onResize(event) {
      this.configureOpenMode(event);
    }

  @HostListener('window:load', ['$event'])
    onload(event) {
      this.configureOpenMode(event);
    }
}
