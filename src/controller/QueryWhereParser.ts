import {InsightError, ResultTooLargeError} from "./IInsightFacade";
import {IHash} from "./InsightFacade";
import RowsSelector from "./RowsSelector";
import {QueryInfo} from "./QueryInfo";
export default class QueryWhereParser  {
    public AST: IFilter = { FilterKey : "", value : [], nodes : []};
    private rowselctr: RowsSelector;
    private queryinfo: QueryInfo;
    constructor(queryinfo: QueryInfo) {
        this.queryinfo = queryinfo; }
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
        let s = null;
        if (element === "IS") {
            if (this.queryinfo.isCourse) {
                s = key.match(this.queryinfo.rescourses);
            } else {
                s = key.match(this.queryinfo.resrooms);
            }
        } else if (element === "LT" || element === "GT" || element === "EQ") {
            if (this.queryinfo.isCourse) {
                s = key.match(this.queryinfo.renumcourses);
            } else {
                s = key.match(this.queryinfo.renumrooms);
            }
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
        this.rowselctr = new RowsSelector(addHash[databasename]);
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
        if (result !== undefined && result.length >= 5000 && !this.queryinfo.hasTransformation) {
            throw new ResultTooLargeError(); }
        return result;
    }
}
