import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'erp-work-flow',
    templateUrl: './work-flow.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkFlowComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
