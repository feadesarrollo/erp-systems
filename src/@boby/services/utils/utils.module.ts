import { NgModule } from '@angular/core';
import { BobyUtilsService } from '@boby/services/utils/utils.service';

@NgModule({
    providers: [
        BobyUtilsService
    ]
})
export class BobyUtilsModule
{
    /**
     * Constructor
     */
    constructor(private _bobyUtilsService: BobyUtilsService)
    {
    }
}
