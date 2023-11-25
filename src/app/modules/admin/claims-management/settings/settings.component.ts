import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'erp-settings',
    templateUrl: './settings.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
