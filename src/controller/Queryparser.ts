import {InsightError, ResultTooLargeError} from "./IInsightFacade";
import {IHash} from "./InsightFacade";
import RowsSelector from "./RowsSelector";
import {QueryInfo} from "./QueryInfo";

export default class Queryparser  {
    private AST: IFilter = { FilterKey : "", value : [], nodes : []};
    private rowselctr: RowsSelector;
    private realapplyobj: any = {};
    private queryinfo: QueryInfo;
    constructor(queryinfo: QueryInfo) {
        this.queryinfo = queryinfo; }
    public executeQuery(query: any, addHash: IHash): any[] {
        if (Object.keys(query["WHERE"]).length === 0) {
            if (addHash[this.queryinfo.databasename].length >= 5000) {
                throw new ResultTooLargeError();
            } else {
                return this.applyOptionswthotTrans(addHash[this.queryinfo.databasename]);
            }
        }
        if (Object.keys(query["WHERE"]).length >= 2) {
            throw new InsightError("More than one key");
        }
        this.AST = this.traverseFilterGenAst(query["WHERE"], null);
        if (!this.queryinfo.hasTransformation) {
            return this.applyOptionswthotTrans(this.astApplyToRow(this.queryinfo.databasename, addHash));
        } else {
            return this.applyOptionswthTrans(this.astApplyToRow(this.queryinfo.databasename, addHash));
        }
    }
    public traverseFilterGenAst(filter: any, AST: IFilter): IFilter {
        let element = Object.keys(filter)[0];
        AST = { FilterKey : "", value : [] , nodes : []};
        AST.FilterKey = element;
        switch (element) {
            case "AND": case "OR":
                AST.nodes = this.logicSymbolTraverse(filter[element], AST, element);
                break;
            case "LT": case "GT": case "EQ": case "IS":
                AST = this.MSSymbolTraverse(filter[element], AST, element);
                break;
            case "NOT":
                AST = this.NegationTraverse(filter[element], AST);
                break;
            default:
                throw new InsightError("Invalid query string 2");
        }
        return AST;
    }
    public logicSymbolTraverse(filtervalue: any, ast: IFilter, element: string): IFilter[] {
        if (!Array.isArray(filtervalue)) {
            throw new InsightError(element + " must be a non-empty array.");
        } else if (filtervalue.length === 0 ) {
            throw new InsightError(element + " must be a non-empty array.");
        }
        for (let eachfilter of filtervalue) {
            if (typeof eachfilter !== "object") {
                throw new InsightError(element + " must be object.");
            } else if (eachfilter === {}) {
                throw new InsightError(element + " should have one key, have 0");
            }
            let newnode: IFilter = { FilterKey : "", value : [] , nodes : []};
            ast.nodes.push(newnode);
            ast.nodes[ast.nodes.length - 1] = this.traverseFilterGenAst(eachfilter, ast.nodes[ast.nodes.length - 1]);
        }
        return ast.nodes;
    }
    public MSSymbolTraverse(filtervalue: any, ast: IFilter, element: string): IFilter {
        if (typeof filtervalue !== "object" || Array.isArray(filtervalue)) {
            throw new InsightError(element + " must be an object.");
        } else if (Object.keys(filtervalue).length !== 1) {
            throw new InsightError(element + " should only have 1 key, has " + Object.keys(filtervalue).length + " .");
        } else {
            this.keyMatchCheck(Object.keys(filtervalue)[0], element);
            let s: string[] = Object.keys(filtervalue)[0].split("_");
            if (this.queryinfo.databasename !== s[0]) {
                throw new InsightError("Cannot query more than one dataset");
            } else {
                ast = { FilterKey : "", value : [], nodes : []}; // ast.nodes.length = 0;
                if (element === "LT" || element === "GT" || element === "EQ") {
                    ast.FilterKey = element;
                    if (typeof filtervalue[Object.keys(filtervalue)[0]] !== "number") {
                        throw new InsightError("Invalid value type in " + element + " , should be number");
                    } else {
                        ast.value = [s[0], s[1], filtervalue[Object.keys(filtervalue)[0]]];
                    }
                } else {
                    ast.FilterKey = "IS";
                    if (typeof filtervalue[Object.keys(filtervalue)[0]] !== "string") {
                        throw new InsightError("Invalid value type in IS , should be string");
                    } else {
                        ast.value = [s[0], s[1], filtervalue[Object.keys(filtervalue)[0]]];
                    }
                }
                return ast;
            }
        }
    }
    public NegationTraverse(filtervalue: any, ast: IFilter): IFilter {
        if (typeof filtervalue !== "object" || Array.isArray(filtervalue)) {
            throw new InsightError("Invalid query string 3");
        } else if (Object.keys(filtervalue).length !== 1) {
            throw new InsightError("NOT should only have 1 key, has " + Object.keys(filtervalue).length + " .");
        } else {
            ast = { FilterKey : "", value : [], nodes : []};
            ast.FilterKey = "NOT";
            let newnode: IFilter = { FilterKey : "", value : [] , nodes : []};
            ast.nodes.push(newnode);
            ast.nodes[0] = this.traverseFilterGenAst(filtervalue, ast.nodes[0]);
        }
        return ast;
    }
    public keyMatchCheck(key: string, element: string) {
        let self = this;
        let s = null;
        if (element === "IS") {
            s = key.match(this.queryinfo.rescourses);
        } else if (element === "LT" || element === "GT" || element === "EQ") {
            s = key.match(this.queryinfo.renumcourses);
        }
        if (s === null) { throw new InsightError("no _"); }
        if (s.length !== 1 || s[0] !== key) { throw new InsightError("key doesn't match");
        } else {return; }
    }
    public astApplyToRow(currentdatabasename: string, addHash: IHash): any[] {
        if (!addHash[currentdatabasename]) {
            throw new InsightError("Referenced dataset " + currentdatabasename + " not added yet");
        }
        return this.traverseAst(this.AST, currentdatabasename, addHash);
    }
    public traverseAst(ast: IFilter, databasename: string, addHash: IHash): any[] {
        let self = this;
        this.rowselctr = new RowsSelector(addHash[databasename], databasename);
        function traverseArray(nodes: IFilter[], identifier: string): any[] {
            let midresult: any[] = [];
            if (identifier === "AND") {
                nodes.forEach((child) => {
                    if (nodes.indexOf(child) === 0) {
                        midresult = RowsSelector.keepboth(midresult, traverseNode(child));
                    } else {
                        midresult = RowsSelector.keepcommon(midresult, traverseNode(child));
                    }
                });
            } else if (identifier === "OR") {
                nodes.forEach((child) => {
                    midresult = RowsSelector.keepboth(midresult, traverseNode(child));
                });
            } else if (identifier === "NOT") {
                nodes.forEach((child) => {
                    midresult = self.rowselctr.reverse(traverseNode(child));
                });
            }
            return midresult;
        }
        function traverseNode(current: IFilter): any[] {
            let midresult: any[] = [];
            if (current === undefined) {throw new InsightError("undefined node?!"); }
            let identifier = current.FilterKey;
            if (identifier === "AND" || identifier === "OR" || identifier === "NOT") {
                midresult = traverseArray(current.nodes, identifier);
            } else if (identifier === "EQ" || identifier === "GT" || identifier === "LT" || identifier === "IS") {
                let value = current.value;
                switch (identifier) {
                    case "EQ":
                        midresult = self.rowselctr.selectrowM(value[1], value[2], "EQ"); break;
                    case "GT":
                        midresult = self.rowselctr.selectrowM(value[1], value[2], "GT"); break;
                    case "LT":
                        midresult = self.rowselctr.selectrowM(value[1], value[2], "LT"); break;
                    case "IS":
                        midresult = self.rowselctr.selectrowS(value[1], value[2]); break;
                }
            }
            return midresult;
        }
        let result = traverseNode(ast);
        if (result !== undefined && result.length >= 5000) {throw new ResultTooLargeError(); }
        return result;
    }
    private applyOptionswthTrans(rowsbeforcolumnseclection: any[]): any[] {
        let self = this;
        let rowsbeforetrans: any[] = [];
        rowsbeforcolumnseclection.forEach((eachrow) => {
            let copiedelement: any = {};
            Object.keys(eachrow).forEach((keytoexamine) => {
                let keytoexaminefull = self.queryinfo.databasename + "_" + keytoexamine;
                if (self.queryinfo.groupKeys.has(keytoexaminefull)) {
                    copiedelement[keytoexaminefull] = eachrow[keytoexamine]; }
                self.queryinfo.columnsToDisp.forEach((potentialkey: any) => {
                    self.queryinfo.query["TRANSFORMATIONS"]["APPLY"].forEach((applyrule: any) => {
                        if (self.queryinfo.applykeys.size !== 0 && applyrule.hasOwnProperty(potentialkey)) {
                            let applykey = Object.keys(applyrule)[0];
                            self.realapplyobj[applykey] = applyrule[applykey];
                            let a: any = applyrule[potentialkey];
                            if (a[Object.keys(a)[0]] === keytoexaminefull) {
                                copiedelement[potentialkey] = eachrow[keytoexamine];
                            }
                        }
                    });
                });
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
            rowsafterapply = this.trimcolumn(rowsbeforeapply);
        }
        if (typeof this.queryinfo.order === "string") {
            return this.rowselctr.sortRowsWithOneOrder(rowsafterapply, this.queryinfo.order);
        } else {
            if (Object.keys(this.queryinfo.order).length === 0 ) {
                return rowsafterapply;
            }
            return this.rowselctr.sortRowsWithObjOrder(rowsafterapply, this.queryinfo.order);
        }
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
            ret.push(RowsSelector.cmptAcrsEachrowinGroup(rowsbeforeapply[key], self.realapplyobj));
        });
        return ret;
    }
    private trimcolumn(rowsafterapply: any): any[] {
        let ret: any[] = [];
        rowsafterapply.forEach((eachrow: any) => {
            let rowtobepushedin: any = {};
            Object.keys(eachrow).forEach((eachkey) => {
                if (this.queryinfo.columnsToDisp.has(eachkey)) {
                    rowtobepushedin[eachkey] = eachrow[eachkey]; }
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
            return this.rowselctr.sortRowsWithOneOrder(rowsbeforesort, this.queryinfo.order);
        } else {
            if (Object.keys(this.queryinfo.order).length === 0 ) {
                return rowsbeforesort;
            }
            return this.rowselctr.sortRowsWithObjOrder(rowsbeforesort, this.queryinfo.order);
        }
    }
}
