import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'erp-human-talent',
    templateUrl: './human-talent.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HumanTalentComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
