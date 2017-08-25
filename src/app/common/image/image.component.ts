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

import {Component, Inject, OnDestroy} from '@angular/core';
import {MD_DIALOG_DATA} from '@angular/material';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Component({
  template: '<img [src]="safeUrl" alt/>'
})
export class ImageComponent implements OnDestroy {

  private objectUrl: string;

  constructor(private domSanitizer: DomSanitizer, @Inject(MD_DIALOG_DATA) public blob: Blob) {
    this.objectUrl = URL.createObjectURL(blob);
  }

  ngOnDestroy(): void {
    URL.revokeObjectURL(this.objectUrl);
  }

  get safeUrl(): SafeUrl {
    return this.domSanitizer.bypassSecurityTrustUrl(this.objectUrl);
  }
}
