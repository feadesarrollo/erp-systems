import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BOBY_MOCK_API_DEFAULT_DELAY } from '@boby/lib/mock-api/mock-api.constants';
import { BobyMockApiInterceptor } from '@boby/lib/mock-api/mock-api.interceptor';

@NgModule({
    providers: [
        {
            provide : HTTP_INTERCEPTORS,
            useClass: BobyMockApiInterceptor,
            multi   : true
        }
    ]
})
export class BobyMockApiModule
{
    /**
     * BobyMockApi module default configuration.
     *
     * @param mockApiServices - Array of services that register mock API handlers
     * @param config - Configuration options
     * @param config.delay - Default delay value in milliseconds to apply all responses
     */
    static forRoot(mockApiServices: any[], config?: { delay?: number }): ModuleWithProviders<BobyMockApiModule>
    {
        return {
            ngModule : BobyMockApiModule,
            providers: [
                {
                    provide   : APP_INITIALIZER,
                    deps      : [...mockApiServices],
                    useFactory: () => (): any => null,
                    multi     : true
                },
                {
                    provide : BOBY_MOCK_API_DEFAULT_DELAY,
                    useValue: config?.delay ?? 0
                }
            ]
        };
    }
}
