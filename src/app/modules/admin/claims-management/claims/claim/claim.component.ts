import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'erp-claim',
    templateUrl: './claim.component.html',
    styleUrls: ['./claim.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimComponent {

    constructor() { }
}
