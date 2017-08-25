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

import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {createNumberMask} from 'text-mask-addons/dist/textMaskAddons';

@Component({
  selector: 'fims-number-input',
  templateUrl: './number-input.component.html'
})
export class NumberInputComponent {

  @Input() placeholder;

  @Input() controlName: string;

  @Input() form: FormGroup;

  @Input() requireDecimal: boolean = true;

  @Input() decimalLimit: number = 2;

  mask: any;

  constructor() {
    this.mask = createNumberMask({
      prefix: '',
      suffix: '',
      includeThousandsSeparator: false,
      requireDecimal: this.requireDecimal,
      allowNegative: false,
      allowLeadingZeroes: true,
      decimalLimit: this.decimalLimit
    });
  }

  hasRequiredError(): boolean {
    return this.hasError('required');
  }

  hasMinValueError(): boolean {
    return this.hasError('minValue');
  }

  hasScaleError(): boolean {
    return this.hasError('scale');
  }

  hasError(key: string): boolean {
    return this.form.get(this.controlName).hasError(key);
  }
}
