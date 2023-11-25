import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'erp-roles',
    templateUrl: './roles.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
