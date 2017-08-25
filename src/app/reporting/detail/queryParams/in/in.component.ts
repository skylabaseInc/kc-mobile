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

import {Component, forwardRef, Input, OnDestroy, OnInit} from '@angular/core';
import {Operator, QueryParameter} from '../../../../services/reporting/domain/query-parameter.model';
import {Type} from '../../../../services/reporting/domain/type.model';
import {
  AbstractControl, ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors,
  Validator, Validators
} from '@angular/forms';
import {AbstractControlValueAccessor} from '../abstract-value-accessor';
import {Subscription} from 'rxjs/Subscription';
import {createPlaceholder} from '../query-params.helper';

export const REPORTING_IN_PARAM_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ReportingInParamComponent),
  multi: true,
};

export const REPORTING_IN_PARAM_VALIDATOR: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => ReportingInParamComponent),
  multi: true,
};

@Component({
  providers: [ REPORTING_IN_PARAM_CONTROL_VALUE_ACCESSOR, REPORTING_IN_PARAM_VALIDATOR ],
  selector: 'fims-reporting-in-param',
  templateUrl: './in.component.html'
})
export class ReportingInParamComponent extends AbstractControlValueAccessor implements ControlValueAccessor, Validator, OnInit, OnDestroy {

  private changeSubscription: Subscription;

  formControl: FormControl;

  @Input() label: string;

  @Input() required: boolean;

  @Input() type: Type;

  @Input() operator: Operator;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.formControl = new FormControl([], this.required ? [Validators.required] : []);

    this.changeSubscription = this.formControl.valueChanges
      .subscribe((value: string[]) => this.value = value.join(','));
  }

  ngOnDestroy(): void {
    this.changeSubscription.unsubscribe();
  }

  validate(c: AbstractControl): ValidationErrors {
    return this.formControl.errors;
  }

  get placeholder(): string {
    return createPlaceholder(this.label, this.required);
  }
}
