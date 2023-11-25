import { NgModule } from '@angular/core';
import { BobyMediaWatcherService } from '@boby/services/media-watcher/media-watcher.service';

@NgModule({
    providers: [
        BobyMediaWatcherService
    ]
})
export class BobyMediaWatcherModule
{
    /**
     * Constructor
     */
    constructor(private _bobyMediaWatcherService: BobyMediaWatcherService)
    {
    }
}
