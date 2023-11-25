import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { ApiErpService } from 'app/core/api-erp/api-erp.service';


@NgModule({
    imports: [
      HttpClientModule
    ],
    providers:[
        ApiErpService
    ]
})
export class ApiErpModule { }
