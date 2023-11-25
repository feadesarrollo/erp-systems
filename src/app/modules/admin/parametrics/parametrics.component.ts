import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'lan-parametrics',
    templateUrl: './parametrics.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParametricsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
