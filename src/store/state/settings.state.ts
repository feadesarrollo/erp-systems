import { Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';
import { SettingsAction } from './settings.actions';

export class SettingsStateModel {
  public items: string[];
}

const defaults = {
  items: []
};

@State<SettingsStateModel>({
  name: 'settings',
  defaults
})
@Injectable()
export class SettingsState {
  @Action(SettingsAction)
  add({ getState, setState }: StateContext<SettingsStateModel>, { payload }: SettingsAction) {
    const state = getState();
    setState({ items: [ ...state.items, payload ] });
  }
}
