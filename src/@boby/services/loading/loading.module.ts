import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BobyLoadingInterceptor } from '@boby/services/loading/loading.interceptor';

@NgModule({
    providers: [
        {
            provide : HTTP_INTERCEPTORS,
            useClass: BobyLoadingInterceptor,
            multi   : true
        }
    ]
})
export class BobyLoadingModule
{
}
