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
       // ** code removed to adhere to collaboration policy
    //* and to benefit future cohorts */
        else {
                this.validateGroup();
                this.validateApply();
        }
    }
    public validateGroup() {
        let s: string[] = [];
        this.query["TRANSFORMATIONS"]["GROUP"].forEach((key: any) => {
          // ** code removed to adhere to collaboration policy
    //* and to benefit future cohorts */
        });
    }
    public validateApply() {
        let self = this;
        let applykey: string;
        this.query["TRANSFORMATIONS"]["APPLY"].forEach((applyRule: any) => {
          // ** code removed to adhere to collaboration policy
    //* and to benefit future cohorts */
            self.applykeys.add(applykey);
        });
    }
    public validateTokenCounterPart(applytoken: any, applyRule: any, applykey: any) {
        if (this.isCourse) {
           // ** code removed to adhere to collaboration policy
    //* and to benefit future cohorts */
    }
    }
    public checkcolumnsWithoutTrans() {
        let self = this;
        this.setDbNameisCourseByFirstColumn();
       // ** code removed to adhere to collaboration policy
    //* and to benefit future cohorts */
    }
    public setDbNameisCourseByFirstColumn() {
        let firstelement = this.query["OPTIONS"]["COLUMNS"][0];
        // ** code removed to adhere to collaboration policy
    //* and to benefit future cohorts */
    }
    public setDbNameisCourseByGroup(): string {
        // ** code removed to adhere to collaboration policy
    //* and to benefit future cohorts */
    }
}
