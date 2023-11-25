import { Component, HostBinding, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { bobyAnimations } from '@boby/animations';
import { BobyCardFace } from '@boby/components/card/card.types';

@Component({
    selector     : 'boby-card',
    templateUrl  : './card.component.html',
    styleUrls    : ['./card.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : bobyAnimations,
    exportAs     : 'bobyCard'
})
export class BobyCardComponent implements OnChanges
{
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_expanded: BooleanInput;
    static ngAcceptInputType_flippable: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    @Input() expanded: boolean = false;
    @Input() face: BobyCardFace = 'front';
    @Input() flippable: boolean = false;

    /**
     * Constructor
     */
    constructor()
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Host binding for component classes
     */
    @HostBinding('class') get classList(): any
    {
        return {
            'boby-card-expanded'  : this.expanded,
            'boby-card-face-back' : this.flippable && this.face === 'back',
            'boby-card-face-front': this.flippable && this.face === 'front',
            'boby-card-flippable' : this.flippable
        };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On changes
     *
     * @param changes
     */
    ngOnChanges(changes: SimpleChanges): void
    {
        // Expanded
        if ( 'expanded' in changes )
        {
            // Coerce the value to a boolean
            this.expanded = coerceBooleanProperty(changes.expanded.currentValue);
        }

        // Flippable
        if ( 'flippable' in changes )
        {
            // Coerce the value to a boolean
            this.flippable = coerceBooleanProperty(changes.flippable.currentValue);
        }
    }
}
