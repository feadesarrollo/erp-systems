export class AddClaims {
  static readonly type = '[ClaimsManagement] Add Claims';
  constructor(public payload: object[]) { }
}

export class AddSelectedClaim {
    static readonly type = '[ClaimsManagement] Add Selected Claim';
    constructor(public payload: object) { }
}

export class AddState {
    static readonly type = '[ClaimsManagement] Add State';
    constructor(public payload: object[]) { }
}

export class AddYear {
    static readonly type = '[ClaimsManagement] Add Year';
    constructor(public payload: object[]) { }
}

export class AddSelectedState {
    static readonly type = '[ClaimsManagement] Add Selected State';
    constructor(public payload: object) { }
}

export class AddSelectedYear {
    static readonly type = '[ClaimsManagement] Add Selected Year';
    constructor(public payload: object) { }
}

export class AddQuery {
    static readonly type = '[ClaimsManagement] Add Query';
    constructor(public payload: string) { }
}

export class AddPermissions {
    static readonly type = '[ClaimsManagement] Add Permissions';
    constructor(public payload: object) { }
}

export class AddViewer {
    static readonly type = '[ClaimsManagement] Add AddViewer';
    constructor(public payload: string) { }
}
