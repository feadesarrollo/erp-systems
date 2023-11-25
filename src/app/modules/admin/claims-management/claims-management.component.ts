import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'erp-claims-management',
    templateUrl: './claims-management.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimsManagementComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
