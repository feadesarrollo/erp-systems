import { Inject, Injectable, Optional } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { Moment } from 'moment';
import * as moment from 'moment';

/*@Injectable()
export class MomentUtcDateAdapter extends MomentDateAdapter {

    constructor(@Optional() @Inject(MAT_DATE_LOCALE) dateLocale: string) {
        super(dateLocale);
    }

    createDate(year: number, month: number, date: number): Moment {
        // Moment.js will create an invalid date if any of the components are out of bounds, but we
        // explicitly check each case so we can throw more descriptive errors.
        if (month < 0 || month > 11) {
            throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
        }

        if (date < 1) {
            throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
        }

        let result = moment.utc({ year, month, date }).locale(this.locale);

        // If the result isn't valid, the date must have been out of bounds for this month.
        if (!result.isValid()) {
            throw Error(`Invalid date "${date}" for month with index "${month}".`);
        }

        return result;
    }
    public format(date: Date, displayFormat: any): string {
        if (displayFormat !== MAT_CUSTOM_DATE_FORMATS.display.dateInput) {
            return super.format(date, displayFormat);
        } else {
            return format(date, MAT_CUSTOM_DATE_FORMATS.display.dateInput);
        }
    }
}*/
/*import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';
import { format } from 'date-fns';


export const MAT_CUSTOM_DATE_FORMATS = {
    parse: {
        dateInput: 'yyyy-MM-dd',
    },
    display: {
        dateInput: 'yyyy-MM-dd',
        monthYearLabel: { year: 'numeric', month: 'short' },
        dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
        monthYearA11yLabel: { year: 'numeric', month: 'long' },
    }
};

@Injectable({
    providedIn: 'root'
})
export class MomentUtcDateAdapter extends NativeDateAdapter {

    public createDate(year: number, month: number, date: number): Date {
        const localDate = super.createDate(year, month, date);
        const offset = localDate.getTimezoneOffset() * 60000;
        return new Date(localDate.getTime() - offset); // utcDate
    }

    public format(date: Date, displayFormat: any): string {
        if (displayFormat !== MAT_CUSTOM_DATE_FORMATS.display.dateInput) {
            return super.format(date, displayFormat);
        } else {
            return format(date, MAT_CUSTOM_DATE_FORMATS.display.dateInput);
        }
    }

}*/


import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { formatDate } from '@angular/common';

export const PICK_FORMATS = {
    parse: {
        dateInput: {month: 'short', year: 'numeric', day: 'numeric'}
    },
    display: {
        dateInput: 'input',
        monthYearLabel: {year: 'numeric', month: 'short'},
        dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
        monthYearA11yLabel: {year: 'numeric', month: 'long'}
    }
};

export class MomentUtcDateAdapter extends NativeDateAdapter {
    format(date: Date, displayFormat: Object): string {
        if (displayFormat === 'input') {
            return formatDate(date,'dd-MMM-yyyy',this.locale);;
        } else {
            return date.toDateString();
        }
    }
}
