import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExtraOptions, PreloadAllModules, RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { BobyModule } from '@boby';
import { BobyConfigModule } from '@boby/services/config';
import { BobyMockApiModule } from '@boby/lib/mock-api';
import { CoreModule } from 'app/core/core.module';
import { NgxsModule } from '@ngxs/store';
import { appConfig } from 'app/core/config/app.config';
import { mockApiServices } from 'app/mock-api';
import { LayoutModule } from 'app/layout/layout.module';
import { AppComponent } from 'app/app.component';
import { appRoutes } from 'app/app.routing';
import { environment } from '../environments/environment';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { SettingsState } from '../store/state/settings.state';
import { ClaimsManagementState } from '../store/claims-management/claims-management.state';

const routerConfig: ExtraOptions = {
    preloadingStrategy       : PreloadAllModules,
    scrollPositionRestoration: 'enabled'
};

@NgModule({
    declarations: [
        AppComponent
    ],
    imports     : [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(appRoutes, routerConfig),

        // Boby, BobyConfig & BobyMockAPI
        BobyModule,
        BobyConfigModule.forRoot(appConfig),
        BobyMockApiModule.forRoot(mockApiServices),

        // Core module of your application
        CoreModule,

        // Layout module of your application
        LayoutModule,

        // 3rd party modules that require global configuration via forRoot
        MarkdownModule.forRoot({}),
        NgxsModule.forRoot([SettingsState, ClaimsManagementState],{ developmentMode : !environment.production })
    ],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'es-bo' }
    ],
    bootstrap   : [
        AppComponent
    ]
})
export class AppModule
{
}
