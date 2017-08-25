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
import {FormComponent} from '../../../../common/forms/form.component';
import {InterestBasis} from '../../../../services/portfolio/domain/interest-basis.model';
import {FormBuilder, FormControl, ValidatorFn, Validators} from '@angular/forms';
import {FimsValidators} from '../../../../common/validator/validators';
import {AccountingService} from '../../../../services/accounting/accounting.service';
import {accountExists} from '../../../../common/validator/account-exists.validator';
import {createNumberMask} from 'text-mask-addons/dist/textMaskAddons';

interface InterestBasisOption {
  type: InterestBasis;
  label: string;
}

export interface InterestFormData {
  interestBasis: InterestBasis;
  incomeAccount: string;
  accrualAccount: string;
}

@Component({
  selector: 'fims-product-interests-form',
  templateUrl: './interests.component.html'
})
export class ProductInterestFormComponent extends FormComponent<InterestFormData> {

  private minMaxValidators: ValidatorFn[] = [Validators.required, FimsValidators.minValue(0), FimsValidators.scale(2)];

  interestBasisOptions: InterestBasisOption[] = [
    {type: 'CURRENT_BALANCE', label: 'CURRENT_BALANCE'},
    {type: 'BEGINNING_BALANCE', label: 'BEGINNING_BALANCE'}
  ];

  @Input() set formData(interestFormData: InterestFormData) {
    // Portfolio service does not support ranges yet
    const interestRangeEnabled: boolean = false;

    this.form = this.formBuilder.group({
      interestRangeEnabled: [interestRangeEnabled],
      interestBasis: [interestFormData.interestBasis, Validators.required],
      incomeAccount: [interestFormData.incomeAccount, [Validators.required], accountExists(this.accountingService)],
      accrualAccount: [interestFormData.accrualAccount, [Validators.required], accountExists(this.accountingService)]
    });

    this.form.get('interestRangeEnabled').valueChanges
      .subscribe(enabled => this.toggleInterestRange(enabled));
  };

  constructor(private formBuilder: FormBuilder, private accountingService: AccountingService) {
    super();
  }

  get formData(): InterestFormData {
    return {
      interestBasis: this.form.get('interestBasis').value,
      incomeAccount: this.form.get('incomeAccount').value,
      accrualAccount: this.form.get('accrualAccount').value
    };
  }

  private toggleInterestRange(enabled: boolean): void {
    const maximumControl: FormControl = this.form.get('maximum') as FormControl;

    if(enabled) {
      maximumControl.setValidators(this.minMaxValidators);
      this.form.setValidators(FimsValidators.greaterThan('minimum', 'maximum'))
    } else {
      maximumControl.clearValidators();
      this.form.clearValidators();
    }

    maximumControl.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }

  private hasValue(value: string): boolean {
    return value !== undefined;
  }


}
