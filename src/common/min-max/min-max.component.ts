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

import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR, Validator, AbstractControl, NG_VALIDATORS,
  FormGroup
} from '@angular/forms';

@Component({
  selector: 'fims-min-max',
  templateUrl: './min-max.component.html'
})
export class MinMaxComponent {

  @Input() minPlaceholder;

  @Input() maxPlaceholder;

  @Input() minControlName: string;

  @Input() maxControlName: string;

  @Input() form: FormGroup;

  @Input() requireDecimal;

  @Input() decimalLimit;
}
