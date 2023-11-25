
export class ClaimsManagementStateModel {
    public claims: object[];
    public selectedClaim: object;
    public state: object[];
    public year: object[];
    public selectedState: object;
    public selectedYear: object;
    public query: string;
    public permissions: object;
    public viewer: string;
}

export const defaults = {
    claims: [],
    selectedClaim: null,
    state: [],
    year: [],
    selectedState: null,
    selectedYear: null,
    query: '',
    permissions:null,
    viewer:'grid'
};
