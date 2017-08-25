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
import {DividendDistribution} from '../../../services/depositAccount/domain/definition/dividend-distribution.model';
import * as dividend from './dividend.actions';

export interface State {
  entities: DividendDistribution[];
}

export const initialState: State = {
  entities: []
};

export function reducer(state = initialState, action: dividend.Actions): State {

  switch (action.type) {

    case dividend.LOAD_ALL: {
      return initialState
    }

    case dividend.LOAD_ALL_COMPLETE: {
      const entities: DividendDistribution[] = action.payload;

      return {
        entities
      };
    }

    case dividend.CREATE_SUCCESS: {
      const entity: DividendDistribution = action.payload.dividendDistribution;

      return {
        entities: [...state.entities, entity]
      }
    }

    default: {
      return state;
    }
  }
}

export const getDividends = (state: State) => state.entities;

