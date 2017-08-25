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

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FimsTaskInstance} from '../store/model/fims-task-instance.model';
import {MdCheckboxChange} from '@angular/material';

export interface SelectTaskEvent {
  taskIdentifier: string;
  checked: boolean;
}

@Component({
  selector: 'fims-case-task',
  templateUrl: './task.component.html'
})
export class CaseTaskComponent implements OnInit {

  @Input() task: FimsTaskInstance;

  @Input() disabled: boolean;

  @Output() onSelectTask = new EventEmitter<SelectTaskEvent>();

  constructor() {}

  ngOnInit() {
  }

  selectTask(change: MdCheckboxChange): void {
    this.onSelectTask.emit({
      taskIdentifier: this.task.taskDefinition.identifier,
      checked: change.checked
    });
  }
}
