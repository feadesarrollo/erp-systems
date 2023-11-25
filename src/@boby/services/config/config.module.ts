import { ModuleWithProviders, NgModule } from '@angular/core';
import { BobyConfigService } from '@boby/services/config/config.service';
import { BOBY_APP_CONFIG } from '@boby/services/config/config.constants';

@NgModule()
export class BobyConfigModule
{
    /**
     * Constructor
     */
    constructor(private _bobyConfigService: BobyConfigService)
    {
    }

    /**
     * forRoot method for setting user configuration
     *
     * @param config
     */
    static forRoot(config: any): ModuleWithProviders<BobyConfigModule>
    {
        return {
            ngModule : BobyConfigModule,
            providers: [
                {
                    provide : BOBY_APP_CONFIG,
                    useValue: config
                }
            ]
        };
    }
}
