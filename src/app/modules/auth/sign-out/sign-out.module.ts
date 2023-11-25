import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { BobyCardModule } from '@boby/components/card';
import { SharedModule } from 'app/shared/shared.module';
import { AuthSignOutComponent } from 'app/modules/auth/sign-out/sign-out.component';
import { authSignOutRoutes } from 'app/modules/auth/sign-out/sign-out.routing';

@NgModule({
    declarations: [
        AuthSignOutComponent
    ],
    imports     : [
        RouterModule.forChild(authSignOutRoutes),
        MatButtonModule,
        BobyCardModule,
        SharedModule
    ]
})
export class AuthSignOutModule
{
}
