import { NgModule } from '@angular/core';
import { BobySplashScreenService } from '@boby/services/splash-screen/splash-screen.service';

@NgModule({
    providers: [
        BobySplashScreenService
    ]
})
export class BobySplashScreenModule
{
    /**
     * Constructor
     */
    constructor(private _bobySplashScreenService: BobySplashScreenService)
    {
    }
}
