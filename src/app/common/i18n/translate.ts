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

import { TranslateService } from '@ngx-translate/core';

export const TRANSLATE_STORAGE_KEY: string = 'fims-translate-lang';

export function getSelectedLanguage(translateService: TranslateService): string {
  const storedLanguage: string = sessionStorage.getItem(TRANSLATE_STORAGE_KEY);

  if (storedLanguage && translateService.getLangs().indexOf(storedLanguage) > -1) {
    return storedLanguage;
  } else if (translateService.getLangs().indexOf(translateService.getBrowserLang()) > -1) {
    return translateService.getBrowserLang();
  }

  return translateService.getDefaultLang();
}
