import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'lan-landing-parking',
    templateUrl: './landing-parking.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingParkingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
