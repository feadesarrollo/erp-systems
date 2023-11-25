import { Injectable } from '@angular/core';
import { BobyDrawerComponent } from '@boby/components/drawer/drawer.component';

@Injectable({
    providedIn: 'root'
})
export class BobyDrawerService
{
    private _componentRegistry: Map<string, BobyDrawerComponent> = new Map<string, BobyDrawerComponent>();

    /**
     * Constructor
     */
    constructor()
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register drawer component
     *
     * @param name
     * @param component
     */
    registerComponent(name: string, component: BobyDrawerComponent): void
    {
        this._componentRegistry.set(name, component);
    }

    /**
     * Deregister drawer component
     *
     * @param name
     */
    deregisterComponent(name: string): void
    {
        this._componentRegistry.delete(name);
    }

    /**
     * Get drawer component from the registry
     *
     * @param name
     */
    getComponent(name: string): BobyDrawerComponent | undefined
    {
        return this._componentRegistry.get(name);
    }
}
