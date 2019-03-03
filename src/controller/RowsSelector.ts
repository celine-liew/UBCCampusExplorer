import {InsightError} from "./IInsightFacade";
import Decimal from "decimal.js";

export default class RowsSelector {
    private allrows: any[] = [];
    constructor(allrows: any[]) {
        this.allrows = allrows;
    }
    public static wildCardHelper(databaseinfo: string, userinput: string): boolean {
       if (databaseinfo === "" || userinput === "") {
           return false;
       }
       if (userinput.includes("*")) {
           if (userinput.indexOf("*") === 0 && userinput[userinput.length - 1] !== "*") {
               let userinputsub = userinput.substring(1, userinput.length);
               let startindex = databaseinfo.length - userinputsub.length;
               if (startindex < 0) {
                   return false;
               }
               let databaseinfosub = databaseinfo.substring(startindex, databaseinfo.length);
               return userinputsub === databaseinfosub;
           } else if (userinput.indexOf("*") === userinput.length - 1 ) {
               let userinputsub = userinput.substring(0, userinput.length - 1);
               let endindex = userinputsub.length;
               if (endindex > databaseinfo.length) {
                   return false;
               }
               let databaseinfosub = databaseinfo.substring(0, endindex);
               return userinputsub === databaseinfosub;
           } else if (userinput.indexOf("*") === 0 && userinput[userinput.length - 1] === "*") {
               let userinputsub = userinput.substring(1, userinput.length - 1);
               return databaseinfo.includes(userinputsub);
           }
       } else {
           return databaseinfo === userinput;
       }
    }
    public static keepcommon(array1: any[], array2: any[]): any[] {
        if (array1 === [] ) {return array1; }
        if (array2 === [] ) { return array2; } else {
            let set = new Set();
            let ret: any[] = [];
            array1.forEach((element) => {
                set.add(element);
            });
            array2.forEach((element) => {
                if (set.has(element)) {
                    ret.push(element);
                }
            });
            return ret;
        }
    }
    public static keepboth(array1: any[], array2: any[]) {
        if (array1 === []) { return array2; } if (array2 === []) { return array1; } else {
            let set = new Set();
            let ret = array1;
            array1.forEach((element) => {
                set.add(element);
            });
            array2.forEach((element) => {
                if (!set.has(element)) {
                    ret.push(element);
                }
            });
            return ret;
        }
    }
    public reverse(array1: any[]) {
        let self = this;
        if (array1.length === 0) {
            return self.allrows;
        } else {
            let set = new Set();
            let ret: any[] = [];
            array1.forEach((element) => {
                set.add(element);
            });
            self.allrows.forEach((element) => {
                if (!set.has(element)) {
                    ret.push(element);
                }
            });
            return ret;
        }
    }
    public selectrowM(key: string, value: number, identifier: string): any[] {
        let ret: any[] = [];
        let self = this;
        switch (identifier) {
            case "EQ":
                self.allrows.forEach((element) => {
                    if (element.hasOwnProperty(key) && element[key] === value) {
                        ret.push(element); }
                });
                break;
            case "GT":
                self.allrows.forEach((element) => {
                    if (element.hasOwnProperty(key) && element[key] > value) {
                        ret.push(element); }
                });
                break;
            case "LT":
                self.allrows.forEach((element) => {
                    if (element.hasOwnProperty(key) && element[key] < value) {
                        ret.push(element); }
                });
                break;
        }
        return ret;
    }
    public selectrowS(key: string, value: string): any[] {
        let self = this;
        if (value === "*" || value === "**") { return self.allrows; }
        let ret: any[] = [];
        let regexp = new RegExp(/^[*]?[^*]*[*]?$/g);
        let s = value.match(regexp);
        if (s === null) {
            throw new InsightError("IS no match");
        }
        if (s.length !== 1 || s[0] !== value) {
            throw new InsightError("key doesn't match");
        } else {
            self.allrows.forEach((element) => {
                if (RowsSelector.wildCardHelper(element[key], value)) {
                    ret.push(element); }
            });
        }
        return ret;
    }

}
