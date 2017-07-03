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

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {PasswordComponent} from './password.component';
import {UserRoutes} from './user.routing';
import {MdButtonModule, MdCardModule, MdInputModule} from '@angular/material';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    RouterModule.forChild(UserRoutes),
    TranslateModule,
    CommonModule,
    ReactiveFormsModule,
    MdCardModule,
    MdInputModule,
    MdButtonModule
  ],
  declarations: [
    PasswordComponent
  ]
})
export class UserModule {}
