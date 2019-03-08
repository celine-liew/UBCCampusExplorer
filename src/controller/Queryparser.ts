import {InsightError, ResultTooLargeError} from "./IInsightFacade";
import {IHash} from "./InsightFacade";
import {QueryInfo} from "./QueryInfo";
import QueryWhereParser from "./QueryWhereParser";
import RowSorter from "./RowSorter";
import ApplyAggregater from "./ApplyAggregater";
export default class Queryparser  {
    private realapplyobj: any = {};
    private queryinfo: QueryInfo;
    private whereparser: QueryWhereParser;
    private sorter: RowSorter = new RowSorter();
    constructor(queryinfo: QueryInfo) {
        this.queryinfo = queryinfo;
    }
    public executeQuery(query: any, addHash: IHash): any[] {
        if (Object.keys(query["WHERE"]).length === 0) {
            if (addHash[this.queryinfo.databasename].length >= 5000 && !this.queryinfo.hasTransformation) {
                throw new ResultTooLargeError();
            } else if (addHash[this.queryinfo.databasename].length < 5000 && !this.queryinfo.hasTransformation) {
                return this.applyOptionswthotTrans(addHash[this.queryinfo.databasename]);
            } else {
                return this.applyOptionswthTrans(addHash[this.queryinfo.databasename]);
            }
        }
        if (Object.keys(query["WHERE"]).length >= 2) {
            throw new InsightError("WHERE should only have 1 key, has 2");
        }
        this.whereparser = new QueryWhereParser(this.queryinfo);
        this.whereparser.AST = this.whereparser.traverseFilterGenAst(query["WHERE"], null);
        if (!this.queryinfo.hasTransformation) {
            return this.applyOptionswthotTrans(this.whereparser.astApplyToRow(this.queryinfo.databasename, addHash));
        } else {
            return this.applyOptionswthTrans(this.whereparser.astApplyToRow(this.queryinfo.databasename, addHash));
        }
    }
    private applyOptionswthTrans(rowsbeforcolumnseclection: any[]): any[] {
        let self = this;
        let rowsbeforetrans: any[] = [];
        rowsbeforcolumnseclection.forEach((eachrow) => {
            let copiedelement: any = {};
            self.queryinfo.columnsToDisp.forEach((requestCol) => {
                if (!requestCol.includes("_")) {
                    self.queryinfo.query["TRANSFORMATIONS"]["APPLY"].forEach((applyrule: any) => {
                        let applykey = Object.keys(applyrule)[0];
                        if (requestCol === applykey) {
                            let applytokenobj = applyrule[applykey];
                            let referredattr = applytokenobj[Object.keys(applytokenobj)[0]];
                            let splittedreferredattr = referredattr.split("_");
                            self.realapplyobj[applykey] = applyrule[applykey];
                            copiedelement[requestCol] = eachrow[splittedreferredattr[1]];
                        }
                    });
                } else {
                    copiedelement[requestCol] = eachrow[requestCol.split("_")[1]];
                }
            });
            Object.keys(eachrow).forEach((keytoexamine) => {
                let keytoexaminefull = self.queryinfo.databasename + "_" + keytoexamine;
                if (self.queryinfo.groupKeys.has(keytoexaminefull)
                && !self.queryinfo.columnsToDisp.has(keytoexaminefull)) {
                    copiedelement[keytoexaminefull] = eachrow[keytoexamine]; }
            });
            rowsbeforetrans.push(copiedelement);
        });
        let rowsbeforeapply: any;
        let rowsafterapply: any[];
        function groupkeyarray(eachrow: any) {
            let ret: any = {};
            self.queryinfo.groupKeys.forEach((groupkey: any) => {
                ret[groupkey] = eachrow[groupkey];
            });
            return ret;
        }
        rowsbeforeapply = this.groupRows(rowsbeforetrans, groupkeyarray);
        if (Object.keys(self.realapplyobj).length !== 0) {
            rowsafterapply = this.trimcolumn(this.applykeyop(rowsbeforeapply));
        } else {
            rowsafterapply = this.trimcolumn(rowsbeforeapply); }
        if (rowsafterapply.length >= 5000) { throw new ResultTooLargeError(); }
        if (typeof this.queryinfo.order === "string") {
            return this.sorter.sortRowsWithOneOrder(rowsafterapply, this.queryinfo.order);
        } else {
            if (Object.keys(this.queryinfo.order).length === 0 ) { return rowsafterapply; }
            return this.sorter.sortRowsWithObjOrder(rowsafterapply, this.queryinfo.order); }
    }
    private groupRows(rowsbeforetrans: any[], groupkeyarray: any): any {
        if (Object.keys(this.realapplyobj).length === 0) {
            let groups: Set<any> = new Set();
            rowsbeforetrans.forEach( function (eachrow) {
                if (!groups.has(eachrow)) {
                    groups.add(groupkeyarray(eachrow));
                }
            });
            return (groups.size !== 0) ? Array.from(groups) : [];
        } else {
            let groups: any = {};
            rowsbeforetrans.forEach( function (eachrow) {
                let group = JSON.stringify(groupkeyarray(eachrow));
                groups[group] = groups[group] || [];
                groups[group].push(eachrow);
            });
            return groups;
        }
    }
    private applykeyop(rowsbeforeapply: any): any[] {
        let self = this;
        let ret: any[] = [];
        Object.keys(rowsbeforeapply).forEach((key) => {
            ret.push(ApplyAggregater.cmptAcrsEachrowinGroup(rowsbeforeapply[key], self.realapplyobj));
        });
        return ret;
    }
    private trimcolumn(rowsafterapply: any): any[] {
        let ret: any[] = [];
        rowsafterapply.forEach((eachrow: any) => {
            let rowtobepushedin: any = {};
            Object.keys(eachrow).forEach((eachkey) => {
                if (this.queryinfo.columnsToDisp.has(eachkey)) {
                    rowtobepushedin[eachkey] = eachrow[eachkey];
                }
            });
            ret.push(rowtobepushedin);
        });
        return ret;
    }
    public applyOptionswthotTrans(rowsbeforeoption: any[]): any[] {
        let self = this;
        let rowsbeforesort: any[] = [];
        rowsbeforeoption.forEach((element) => {
            let copiedelement: any = {};
            Object.keys(element).forEach((keytoexamine) => {
                let keytoexaminefull = self.queryinfo.databasename + "_" + keytoexamine;
                if (self.queryinfo.columnsToDisp.has(keytoexaminefull)) {
                    copiedelement[keytoexaminefull] = element[keytoexamine];
                }
            });
            rowsbeforesort.push(copiedelement);
        });
        if (typeof this.queryinfo.order === "string") {
            return this.sorter.sortRowsWithOneOrder(rowsbeforesort, this.queryinfo.order);
        } else {
            if (Object.keys(this.queryinfo.order).length === 0 ) {
                return rowsbeforesort;
            }
            return this.sorter.sortRowsWithObjOrder(rowsbeforesort, this.queryinfo.order);
        }
    }
}
