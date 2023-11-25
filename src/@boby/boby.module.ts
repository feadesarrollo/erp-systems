import { NgModule, Optional, SkipSelf } from '@angular/core';
import { MATERIAL_SANITY_CHECKS } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { BobyConfirmationModule } from '@boby/services/confirmation';
import { BobyLoadingModule } from '@boby/services/loading';
import { BobyMediaWatcherModule } from '@boby/services/media-watcher/media-watcher.module';
import { BobySplashScreenModule } from '@boby/services/splash-screen/splash-screen.module';
import { BobyUtilsModule } from '@boby/services/utils/utils.module';

@NgModule({
    imports  : [
        BobyConfirmationModule,
        BobyLoadingModule,
        BobyMediaWatcherModule,
        BobySplashScreenModule,
        BobyUtilsModule
    ],
    providers: [
        {
            // Disable 'theme' sanity check
            provide : MATERIAL_SANITY_CHECKS,
            useValue: {
                doctype: true,
                theme  : false,
                version: true
            }
        },
        {
            // Use the 'fill' appearance on Angular Material form fields by default
            provide : MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                appearance: 'fill'
            }
        }
    ]
})
export class BobyModule
{
    /**
     * Constructor
     */
    constructor(@Optional() @SkipSelf() parentModule?: BobyModule)
    {
        if ( parentModule )
        {
            throw new Error('BobyModule has already been loaded. Import this module in the AppModule only!');
        }
    }
}
