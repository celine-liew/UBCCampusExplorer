import {InsightError} from "./IInsightFacade";
// import "./QueryInfo";
import QueryInfo from "./QueryInfo";
export default class QueryValidator  {
    public queryinfo: QueryInfo;
    public validatequery(query: any) {
        this.queryinfo = new QueryInfo(query);
        let keys: string[];
        keys = Object.keys(query);
        if (keys.length >= 4) {
            throw new InsightError("Excess keys in query");
        } else {
            if (!query.hasOwnProperty("WHERE")) {
                throw new InsightError("Missing Where");
                // There must be property of "WHERE", but for a small dataset < 5000 rows, it may be empty
            } else if (!query.hasOwnProperty("OPTIONS")) {
                throw new InsightError("Missing Options");
            } else if (!(query["OPTIONS"].hasOwnProperty("COLUMNS"))) {
                throw new InsightError("Options Missing Columns");
            } else if (query["OPTIONS"]["COLUMNS"].length <= 0) {
                throw new InsightError("Columns must be an un-empty array");
            } else if (keys.length === 3 && !query.hasOwnProperty("TRANSFORMATION")) {
                throw new InsightError("Missing Transformation, has some wrong key");
            } else if (query.hasOwnProperty("TRANSFORMATION")) {
                this.queryinfo.hasTransformation = true;
                this.validateWhere(query["WHERE"]);
                this.validateOptions(query["OPTIONS"]);
                return;
            } else {
                this.queryinfo.hasTransformation = false;
                this.validateWhere(query["WHERE"]);
                this.validateOptions(query["OPTIONS"]);
                return;
            }
        }
    }
    public validateWhere(wherepart: any) {
        if (typeof wherepart !== "object") { throw new InsightError("Where must be an object");
        // } else if (wherepart.length === 0) {
            // throw new InsightError("Where must be non-empty");
        } else if (Object.keys(wherepart).length > 1) {
            throw new InsightError("Excess keys in where");
        } else {
            return;
        }
    }
    public validateOptions(optionpart: any) {
        let self = this;
        if (typeof optionpart !== "object") {
            throw new InsightError("Options must be an object");
        } else {
            let keys = Object.keys(optionpart);
            if (!optionpart.hasOwnProperty("COLUMNS")) {
                throw new InsightError("Missing Columns");
            } else if (!Array.isArray(optionpart["COLUMNS"])) {
                throw new InsightError("Invalid query string 0");
            } else if (optionpart["COLUMNS"].length === 0) {
                throw new InsightError("COLUMNS must be non-empty");
            }
            if ((keys.length === 2 && !optionpart.hasOwnProperty("ORDER")) || keys.length >= 3) {
                throw new InsightError("Invalid keys in OPTIONS");
            }
            if (optionpart.hasOwnProperty("ORDER")) {
                if (typeof optionpart["ORDER"] !== "object" && typeof optionpart["ORDER"] !== "string") {
                    throw new InsightError("Invalid ORDER type");
                }
            }
            optionpart["COLUMNS"].forEach((element: any) => {
                if (typeof element !== "string") {
                    throw new InsightError("Invalid query string 1");
                }
            });
            if (self.queryinfo.hasTransformation) {
                this.checkcolumnsWithTrans();
            } else {
                this.checkcolumnsWithoutTrans();
            }
            if (optionpart.hasOwnProperty("ORDER")) {
                this.checkorder(self.queryinfo.columnsToDisp, optionpart["ORDER"]);
            }
            return;
        }
    }
    public checkcolumnsWithTrans() {
        let self = this;
        this.setDbNameByFirstColumn();
        self.validateTransForm();
        self.queryinfo.columnsToDisp = new Set<string>();
        self.queryinfo.query["OPTIONS"]["COLUMNS"].forEach((eachcolumn: any) => {
            let flwstrings: string[] = [];
            if (self.queryinfo.isCourse) {
                flwstrings = eachcolumn.match(self.queryinfo.recourses);
            } else {
                flwstrings = eachcolumn.match(self.queryinfo.rerooms);
            }
            if (flwstrings.length !== 1 || flwstrings[0] !== eachcolumn) {
                throw new InsightError("key doesn't match, being wrong key, or intertwining rooms and courses");
            } else {
                let s3 = flwstrings[0].split("_");
                if ( self.queryinfo.databasename !== s3[0]) {
                    throw new InsightError("Cannot query more than one dataset");
                } else if (!self.queryinfo.applykeys.has(s3[0]) && !self.queryinfo.groupKeys.has(s3[0])) {
                    throw new InsightError("Keys in COLUMNS must be in GROUP or APPLY when TRANSFORMATIONS is present");
                } else {
                    self.queryinfo.columnsToDisp.add(eachcolumn);
                }
            }
        });
    }
    public validateTransForm() {
        let self = this;
        if (typeof self.queryinfo.query["TRANSFORMATION"] !== "object") {
            throw new InsightError("Transformation must be an object");
        } else {
            let keys = Object.keys(self.queryinfo.query["TRANSFORMATION"]);
            if (!self.queryinfo.query["TRANSFORMATION"].hasOwnProperty("GROUP")) {
                throw new InsightError("Missing GROUP");
            } else if (!Array.isArray(self.queryinfo.query["TRANSFORMATION"]["GROUP"])) {
                throw new InsightError("GROUP must be an array");
            } else if (self.queryinfo.query["TRANSFORMATION"]["GROUP"].length === 0) {
                throw new InsightError("GROUP must be an non-empty array");
            } else if (!self.queryinfo.query["TRANSFORMATION"].hasOwnProperty("APPLY")) {
                throw new InsightError("Missing APPLY");
            } else if (!Array.isArray(self.queryinfo.query["TRANSFORMATION"]["APPLY"])) {
                throw new InsightError("APPLY must be an array");
            } else if (keys.length >= 3) {
                throw new InsightError("Invalid Transformation with excess keys");
            } else {
                self.validateGroup();
                self.validateApply();
            }
        }
    }
    public validateGroup() {
        let self = this;
        let s: string[] = [];
        self.queryinfo.query["TRANSFORMATION"]["GROUP"].foreach((key: any) => {
            if (typeof key !== "string") {
                throw new InsightError("invalid group key");
            } else if (self.queryinfo.isCourse) {
                s = key.match(self.queryinfo.recourses);
            } else {
                s = key.match(self.queryinfo.rerooms);
            }
            if (s.length !== 1 || s[0] !== key) {
                throw new InsightError("Group key doesn't match");
            } else {
                let s3 = s[0].split("_");
                if ( self.queryinfo.databasename !== s3[0]) {
                    throw new InsightError("Cannot query more than one dataset");
                } else {
                    self.queryinfo.groupKeys.add(s[0]);
                }
            }
        });
    }
    public validateApply() {
        let self = this;
        let applykey: string;
        let applytoken: string;
        let applytokenreg = new RegExp(/^(MAX|MIN|AVG|COUNT|SUM)$/g);
        self.queryinfo.query["TRANSFORMATION"]["APPLY"].foreach((applyRule: any) => {
            if (typeof applyRule !== "object") {
                throw new InsightError("APPLYRULES should be json objects");
            } else if (Object.keys(applyRule).length !== 1) {
                throw new InsightError("Apply rule should only have 1 key, has " + Object.keys(applyRule).length);
            } else {
                applykey = Object.keys(applyRule)[0];
                self.queryinfo.applykeys.add(applykey);
            }
            if (Object.keys(applyRule[applykey]).length !== 1) {
                let l: number = Object.keys(applyRule[applykey]).length;
                throw new InsightError("Apply body should only have 1 key, has " + l);
            } else {
                applytoken = Object.keys(applyRule[applykey])[0];
                if (!applytokenreg.test(applytoken)) {
                    throw new InsightError("Wrong Apply Token");
                } else if (typeof applyRule[applykey][applytoken] !== "string") {
                    throw new InsightError("apply should excute on string");
                } else {
                    if (self.queryinfo.isCourse && self.queryinfo.recourses.test(applyRule[applykey][applytoken])) {
                        self.queryinfo.applykeys.add(applyRule[applykey][applytoken]);
                    }
                    if (!self.queryinfo.isCourse && self.queryinfo.rerooms.test(applyRule[applykey][applytoken])) {
                        self.queryinfo.applykeys.add(applyRule[applykey][applytoken]);
                    } else {
                        throw new InsightError("key to apply is mismatched");
                    }
                }
            }
        });
    }
    public checkcolumnsWithoutTrans() {
        let self = this;
        this.setDbNameByFirstColumn();
        self.queryinfo.columnsToDisp = new Set<string>();
        self.queryinfo.query["OPTIONS"]["COLUMNS"].forEach((element: any) => {
            let flwstrings: string[] = [];
            if (self.queryinfo.isCourse) {
                flwstrings = element.match(self.queryinfo.recourses);
            } else {
                flwstrings = element.match(self.queryinfo.rerooms);
            }
            if (flwstrings.length !== 1 || flwstrings[0] !== element) {
                throw new InsightError("key doesn't match");
            } else {
                let s3 = flwstrings[0].split("_");
                if ( self.queryinfo.databasename !== s3[0]) {
                    throw new InsightError("Cannot query more than one dataset");
                } else {
                    self.queryinfo.columnsToDisp.add(element);
                }
            }
        });
    }
    private setDbNameByFirstColumn() {
        let self = this;
        let firstelement = Object.keys(self.queryinfo.query["OPTIONS"]["COLUMNS"])[0];
        let s = firstelement.match(self.queryinfo.recourses);
        // let isCourse: boolean;
        if (s.length !== 1 || s[0] !== firstelement) {
            s = firstelement.match(self.queryinfo.rerooms);
            if (s.length !== 1 || s[0] !== firstelement) {
                throw new InsightError("key doesn't match");
            } else {
                self.queryinfo.isCourse = false;
            }
        } else {
            self.queryinfo.isCourse = true;
        }
        let s2 = firstelement.split("_");
        self.queryinfo.databasename = s2[0];
    }
    public checkorder(columns: Set<string>, order: any) {
        let self = this;
        if (typeof order === "string") {
            let flag = false;
            columns.forEach((element) => {
                if (element === order) {
                    flag = true;
                }
            });
            if (!flag) {
                throw new InsightError("ORDER key must be in COLUMNS");
            }
        } else {
            this.checkOrderObj(columns, order);
        }
        self.queryinfo.order = order;
    }
    public checkOrderObj(columns: Set<string>, order: any) {
        let l = Object.keys(order).length;
        if (l !== 2) {
            throw new InsightError("ORDER key should have two dir and keys, have " + l);
        } else if (!order.hasOwnProperty("dir")) {
            throw new InsightError("invalid order key, missing dir");
        } else if (!order.hasOwnProperty("keys")) {
            throw new InsightError("invalid order key, missing keys");
        }
        if (order["dir"] !== "UP" && order["dir"] !== "DOWN") {
            throw new InsightError("invalid order direction");
        }
        if (!Array.isArray(order["keys"])) {
            throw new InsightError("invalid order, keys should be an array");
        } else if (order["keys"].length === 0) {
            throw new InsightError("invalid order, keys should be an non-empty array");
        } else {
            order["keys"].foreach((orderKey: any) => {
                let flag = false;
                columns.forEach((element) => {
                    if (element === orderKey) {
                        flag = true;
                    }
                });
                if (!flag) {
                    throw new InsightError("ORDER key must be in COLUMNS");
                }
            });
        }
    }
}
