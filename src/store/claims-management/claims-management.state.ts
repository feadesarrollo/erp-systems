import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { AddClaims, AddSelectedClaim, AddState, AddYear, AddSelectedState, AddSelectedYear, AddQuery, AddPermissions, AddViewer } from './claims-management.actions';
import { ClaimsManagementStateModel, defaults } from './claims-management.model';


@State<ClaimsManagementStateModel>({
  name: 'claimsManagement',
  defaults
})
@Injectable()
export class ClaimsManagementState {

    @Selector()
    public static getClaims( { claims }: any ){
        return claims;
    }
    @Action(AddClaims)
    addClaims(
      { getState, patchState }: StateContext<ClaimsManagementStateModel>,
      { payload }: AddClaims
    ) {
      const state = getState();
      patchState({
          ...state,
          claims: payload
      });
    }

    @Selector()
    public static getSelectedClaim( { selectedClaim }: any ){
        return selectedClaim;
    }
    @Action(AddSelectedClaim)
    addSelectedClaim(
        { getState, patchState }: StateContext<ClaimsManagementStateModel>,
        { payload }: AddSelectedClaim
    ) {
        const state = getState();
        patchState({
            ...state,
            selectedClaim: payload
        });
    }

    @Selector()
    public static getState( { state }: any ){
        return state;
    }
    @Action(AddState)
    addState(
        { getState, patchState }: StateContext<ClaimsManagementStateModel>,
        { payload }: AddState
    ) {
        const state = getState();
        patchState({
            ...state,
            state: payload
        });
    }

    @Selector()
    public static getYear( { year }: any ){
        return year;
    }
    @Action(AddYear)
    addYear(
        { getState, patchState }: StateContext<ClaimsManagementStateModel>,
        { payload }: AddYear
    ) {
        const state = getState();
        patchState({
            ...state,
            year: payload
        });
    }


    @Selector()
    public static getSelectedState( { selectedState }: any ){
        return selectedState;
    }
    @Action(AddSelectedState)
    addSelectedState(
        { getState, patchState }: StateContext<ClaimsManagementStateModel>,
        { payload }: AddSelectedState
    ) {
        const state = getState();
        patchState({
            ...state,
            selectedState: payload
        });
    }


    @Selector()
    public static getSelectedYear( { selectedYear }: any ){
        return selectedYear;
    }
    @Action(AddSelectedYear)
    addSelectedYear(
        { getState, patchState }: StateContext<ClaimsManagementStateModel>,
        { payload }: AddSelectedYear
    ) {
        const state = getState();
        patchState({
            ...state,
            selectedYear: payload
        });
    }

    @Selector()
    public static getQuery( { query }: any ){
        return query;
    }
    @Action(AddQuery)
    addQuery(
        { getState, patchState }: StateContext<ClaimsManagementStateModel>,
        { payload }: AddQuery
    ) {
        const state = getState();
        patchState({
            ...state,
            query: payload
        });
    }

    @Selector()
    public static getPermissions( { permissions }: any ){
        return permissions;
    }
    @Action(AddPermissions)
    addPermissions(
        { getState, patchState }: StateContext<ClaimsManagementStateModel>,
        { payload }: AddPermissions
    ) {
        const state = getState();
        patchState({
            ...state,
            permissions: payload
        });
    }

    @Selector()
    public static getViewer( { viewer }: any ){
        return viewer;
    }
    @Action(AddViewer)
    addViewer(
        { getState, patchState }: StateContext<ClaimsManagementStateModel>,
        { payload }: AddViewer
    ) {
        const state = getState();
        patchState({
            ...state,
            viewer: payload
        });
    }

}
