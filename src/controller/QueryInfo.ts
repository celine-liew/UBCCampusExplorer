// tslint:disable
import {InsightError} from "./IInsightFacade";

export class QueryInfo {
    public query: any;
    public columnsToDisp: Set<string>;
    public groupKeys: Set<string>;
    public applykeys: Set<string>;
    public hasTransformation: boolean;
    public databasename: string;
    public isCourse: boolean;
    public order: any;
    public recourses = new RegExp(/[^_]+_(avg|pass|fail|audit|year|dept|id|instructor|title|uuid)$/g);
    public rerooms =
        new RegExp(/[^_]+_(lat|lon|seats|fullname|shortname|number|name|address|type|furniture|href)$/g);
    public renumrooms = new RegExp(/[^_]+_(lat|lon|seats)$/g);
    public resrooms = new RegExp(/[^_]+_(fullname|shortname|number|name|address|type|furniture|href)$/g);
    public renumcourses = new RegExp(/[^_]+_(avg|pass|fail|audit|year)$/g);
    public rescourses = new RegExp(/[^_]+_(dept|id|instructor|title|uuid)$/g);

    constructor(query: any) {
        this.query = query;
        this.columnsToDisp = new Set<string>();
        this.groupKeys = new Set<string>();
        this.applykeys = new Set<string>();
        this.hasTransformation = false;
        this.databasename = undefined;
        this.isCourse = false;
        this.order = {};
    }

    public getquery(): any {
        return this.query;
    }
    public checkcolumnsWithTrans() {
        let self = this;
        this.setDbNameisCourseByFirstColumn();
        this.validateTransForm();
        this.columnsToDisp = new Set<string>();
        this.query["OPTIONS"]["COLUMNS"].forEach((eachcolumn: string) => {
            if (!eachcolumn.includes("_")) {
                if (self.applykeys.size === 0 || !self.applykeys.has(eachcolumn)) {
                    throw new InsightError("Keys in COLUMNS must be in GROUP or APPLY when TRANSFORMATIONS is present");
                } else {
                    self.columnsToDisp.add(eachcolumn);
                }
            } else {
                let flwstrings: string[] = [];
                if (self.isCourse) {
                    flwstrings = eachcolumn.match(self.recourses);
                } else {
                    flwstrings = eachcolumn.match(self.rerooms);
                }
                if ( flwstrings === null ) {
                    throw new InsightError("invalid key " + eachcolumn + " in columns, with underscore");
                } else if (flwstrings.length !== 1 || flwstrings[0] !== eachcolumn) {
                    throw new InsightError("key doesn't match, being wrong key, or intertwining rooms and courses");
                } else {
                    let s3 = flwstrings[0].split("_");
                    if ( self.databasename !== s3[0]) {
                        throw new InsightError("Cannot query more than one dataset");
                    } else if (!self.groupKeys.has(flwstrings[0])) {
                        throw new InsightError
                            ("Keys in COLUMNS must be in GROUP or APPLY when TRANSFORMATIONS is present");
                    } else {
                        self.columnsToDisp.add(eachcolumn);
                    }
                }
            }
        });
    }
    public validateTransForm() {
        if (typeof this.query["TRANSFORMATIONS"] !== "object") {
            throw new InsightError("Transformation must be an object");
        } else {
            let keys = Object.keys(this.query["TRANSFORMATIONS"]);
            if (!this.query["TRANSFORMATIONS"].hasOwnProperty("GROUP")) {
                throw new InsightError("Missing GROUP");
            } else if (!Array.isArray(this.query["TRANSFORMATIONS"]["GROUP"])) {
                throw new InsightError("GROUP must be an array");
            } else if (this.query["TRANSFORMATIONS"]["GROUP"].length === 0) {
                throw new InsightError("GROUP must be an non-empty array");
            } else if (!this.query["TRANSFORMATIONS"].hasOwnProperty("APPLY")) {
                throw new InsightError("Missing APPLY");
            } else if (!Array.isArray(this.query["TRANSFORMATIONS"]["APPLY"])) {
                throw new InsightError("APPLY must be an array");
            } else if (keys.length >= 3) {
                throw new InsightError("Invalid Transformation with excess keys");
            } else {
                this.validateGroup();
                this.validateApply();
            }
        }
    }
    public validateGroup() {
        let s: string[] = [];
        this.query["TRANSFORMATIONS"]["GROUP"].forEach((key: any) => {
            if (typeof key !== "string") {
                throw new InsightError("invalid group key");
            } else if (this.isCourse) {
                s = key.match(this.recourses);
            } else {
                s = key.match(this.rerooms);
            }
            if (s.length !== 1 || s[0] !== key) {
                throw new InsightError("Group key doesn't match");
            } else {
                let s3 = s[0].split("_");
                if ( this.databasename !== s3[0]) {
                    throw new InsightError("Cannot query more than one dataset");
                } else {
                    this.groupKeys.add(s[0]);
                }
            }
        });
    }
    public validateApply() {
        let self = this;
        let applykey: string;
        this.query["TRANSFORMATIONS"]["APPLY"].forEach((applyRule: any) => {
            if (typeof applyRule !== "object") {
                throw new InsightError("APPLYRULES should be json objects");
            } else if (Object.keys(applyRule).length !== 1) {
                throw new InsightError("Apply rule should only have 1 key, has " + Object.keys(applyRule).length);
            } else {
                applykey = Object.keys(applyRule)[0];
                if (applykey.includes("_")) {
                    throw new InsightError("Cannot have underscore in applyKey");
                }
            }
            if (Object.keys(applyRule[applykey]).length !== 1) {
                let l: number = Object.keys(applyRule[applykey]).length;
                throw new InsightError("Apply body should only have 1 key, has " + l);
            } else {
                let applytokenreg = new RegExp(/^(MAX|MIN|AVG|COUNT|SUM)$/);
                let applytoken = Object.keys(applyRule[applykey])[0];
                if (!applytokenreg.test(applytoken)) {
                    throw new InsightError("Wrong Apply Token");
                } else if (typeof applyRule[applykey][applytoken] !== "string") {
                    throw new InsightError("apply should excute on string");
                } else {
                    self.validateTokenCounterPart(applytoken, applyRule, applykey);
                }
            }
            if (self.applykeys.has(applykey)) {
                throw new InsightError("Cannot have duplicate applyrule identifier");
            }
            self.applykeys.add(applykey);
        });
    }
    public validateTokenCounterPart(applytoken: any, applyRule: any, applykey: any) {
        if (this.isCourse) {
            let renumcourses = new RegExp(/[^_]+_(avg|pass|fail|audit|year)$/);
            let recourses = new RegExp(/[^_]+_(avg|pass|fail|audit|year|dept|id|instructor|title|uuid)$/);
            if (applytoken !== "COUNT") {
                if (! renumcourses.test(applyRule[applykey][applytoken])) {
                    throw new InsightError("key to apply is mismatched"); }
            } else if (! recourses.test(applyRule[applykey][applytoken])) {
                throw new InsightError("key to apply is mismatched"); }}
        if (!this.isCourse) {
            let rerooms =
    new RegExp(/[^_]+_(lat|lon|seats|fullname|shortname|number|name|address|type|furniture|href)$/);
            let renumrooms = new RegExp(/[^_]+_(lat|lon|seats)$/);
            if (applytoken !== "COUNT") {
                if (! renumrooms.test(applyRule[applykey][applytoken])) {
                    throw new InsightError("key to apply is mismatched"); }
            } else if (! rerooms.test(applyRule[applykey][applytoken])) {
                throw new InsightError("key to apply is mismatched"); }
        }
        let s3 = applyRule[applykey][applytoken].split("_");
        if (s3[0] !== this.databasename) {
            throw new InsightError("Cannot query more than one database");
        }
    }
    public checkcolumnsWithoutTrans() {
        let self = this;
        this.setDbNameisCourseByFirstColumn();
        this.query["OPTIONS"]["COLUMNS"].forEach((element: any) => {
            let flwstrings: string[] = [];
            if (self.isCourse) {
                flwstrings = element.match(this.recourses);
            } else {
                flwstrings = element.match(this.rerooms);
            }
            if (flwstrings.length !== 1 || flwstrings[0] !== element) {
                throw new InsightError("key doesn't match");
            } else {
                let s3 = flwstrings[0].split("_");
                if ( self.databasename !== s3[0]) {
                    throw new InsightError("Cannot query more than one dataset");
                } else {
                    self.columnsToDisp.add(element);
                }
            }
        });
    }
    public setDbNameisCourseByFirstColumn() {
        let firstelement = this.query["OPTIONS"]["COLUMNS"][0];
        if (firstelement.includes("_")) {
            let recourses = new RegExp(/[^_]+_(avg|pass|fail|audit|year|dept|id|instructor|title|uuid)$/);
            let rerooms =
                new RegExp(/[^_]+_(lat|lon|seats|fullname|shortname|number|name|address|type|furniture|href)$/);
            if (recourses.test(firstelement)) {
                let s3 = firstelement.split("_");
                this.databasename = s3[0];
                this.isCourse = true;
            } else if (rerooms.test(firstelement)) {
                let s3 = firstelement.split("_");
                this.databasename = s3[0];
                this.isCourse = false;
            } else {
                throw new InsightError("invalid first key in column");
            }
        } else {
            if (!this.hasTransformation) {
                throw new InsightError("invalid first key in column");
            } else {
                firstelement = this.setDbNameisCourseByGroup();
                let s3 = firstelement.split("_");
                this.databasename = s3[0];
            }
        }
    }
    public setDbNameisCourseByGroup(): string {
        let groupkeys = this.query["TRANSFORMATIONS"]["GROUP"];
        let recourses = new RegExp(/[^_]+_(avg|pass|fail|audit|year|dept|id|instructor|title|uuid)$/);
        let rerooms =
                new RegExp(/[^_]+_(lat|lon|seats|fullname|shortname|number|name|address|type|furniture|href)$/);
        if (!Array.isArray(groupkeys)) { throw new InsightError("Group must be an non-empty array");
        } else if (groupkeys.length === 0) {
            throw new InsightError("Group must be an non-empty array");
        } else {
            let firstgroupkey = groupkeys[0];

            if (typeof firstgroupkey !== "string") { throw new InsightError("Group must be an non-empty array of string");
            } else {
                if (recourses.test(firstgroupkey)) {
                    this.isCourse = true;
                    return firstgroupkey;
                } else if (rerooms.test(firstgroupkey)) {
                    this.isCourse = false;
                    return firstgroupkey;
                } else { throw new InsightError("Invalid group key string");}
            }
        }
    }
}
