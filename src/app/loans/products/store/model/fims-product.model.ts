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

import {ProductParameters} from '../../../../../services/portfolio/domain/individuallending/product-parameters.model';
import {AccountAssignment} from '../../../../../services/portfolio/domain/account-assignment.model';
import {InterestBasis} from '../../../../../services/portfolio/domain/interest-basis.model';
import {InterestRange} from '../../../../../services/portfolio/domain/interest-range.model';
import {BalanceRange} from '../../../../../services/portfolio/domain/balance-range.model';
import {TermRange} from '../../../../../services/portfolio/domain/term-range.model';

/**
 * Model interface with concrete ProductParameters instead of JSON string.
 */

export interface FimsProduct {
  identifier: string;
  name: string;
  termRange: TermRange;
  balanceRange: BalanceRange;
  interestRange: InterestRange;
  interestBasis: InterestBasis;
  patternPackage: string;
  description: string;
  accountAssignments: AccountAssignment[];
  parameters: ProductParameters;
  currencyCode: string;
  minorCurrencyUnitDigits: number;
  enabled?: boolean;
}


