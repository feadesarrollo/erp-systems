import { NgModule } from '@angular/core';
import { BobyFindByKeyPipe } from '@boby/pipes/find-by-key/find-by-key.pipe';

@NgModule({
    declarations: [
        BobyFindByKeyPipe
    ],
    exports     : [
        BobyFindByKeyPipe
    ]
})
export class BobyFindByKeyPipeModule
{
}
