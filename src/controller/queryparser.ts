import {IInsightFacade, InsightDataset, InsightDatasetKind, ResultTooLargeError} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import InsightFacade, { IHash } from "./InsightFacade";
export default class Queryparser {
    private AST: IFilter = { FilterKey : "", value : [], nodes : []};
    private rowsbeforeoption: any[] = [];
    private allrows: any[] = [];
    private currentdatabasename: string = undefined;
    public columnstoshow = new Set<string>();
    public order: string = undefined;
    public excutequery(query: any, addHash: IHash, databasename: string): any[] {
        this.traverseFilterGenAst(query["WHERE"], this.AST);
        if ( this.currentdatabasename !== databasename) {
            throw new InsightError("Cannot query more than one dataset 2");
        }
        this.astApplyToRow(this.currentdatabasename, addHash);
        this.applyOptions();
        return this.rowsbeforeoption;
    }
    public traverseFilterGenAst(filter: any, ast: IFilter) {
        let element = Object.keys(filter)[0];
        switch (element) {
            case "AND": case "OR":
                this.logicSymbolTraverse(filter[element], ast, element);
                break;
            case "LT": case "GT": case "EQ": case "IS":
                this.MSSymbolTraverse(filter[element], ast, element);
                break;
            case "NOT":
                this.NegationTraverse(filter[element], ast);
                break;
            default:
                throw new InsightError("Invalid query string"); }
    }
    public logicSymbolTraverse(filtervalue: any, ast: IFilter, element: string) {
        if (!Array.isArray(filtervalue) || filtervalue.length === 0) {
            throw new InsightError(element + " must be a non-empty array.");
        }
        ast.FilterKey = element; // ast.nodes.length = filter[element].length;
        for (let eachfilter of filtervalue) {
            if (typeof eachfilter !== "object") {
                throw new InsightError(element + " must be object.");
            } // ast.FilterKey.value = eachfilter;
            ast.nodes.push(eachfilter);
            this.traverseFilterGenAst(eachfilter, ast.nodes[ast.nodes.length - 1]);
        }
    }
    public MSSymbolTraverse(filtervalue: any, ast: IFilter, element: string) {
        if (typeof filtervalue !== "object" || Array.isArray(filtervalue)) {
            throw new InsightError(element + " must be an object.");
        } else if (Object.keys(filtervalue).length !== 1) {
            throw new InsightError(element + " should only have 1 key, has " + Object.keys(filtervalue).length + " .");
        } else {
            this.getStringToFrst_(Object.keys(filtervalue)[0], element);
            let s: string[] = Object.keys(filtervalue)[0].split("_");
            if (this.currentdatabasename === undefined) {
                this.currentdatabasename = s[0];
            } else if (this.currentdatabasename !== s[0]) {
                throw new InsightError("Cannot query more than one dataset 3");
            } else {
                ast.nodes.length = 0;
                if (element === "LT" || "GT" || "EQ") {
                    ast.FilterKey = element;
                    if (typeof filtervalue(Object.keys(filtervalue)[0]) !== "number") {
                        throw new InsightError("Invalid value type in " + element + " , should be number");
                    } else {
                        ast.value = [s[0], s[1], filtervalue(Object.keys(filtervalue)[0])];
                    }
                } else {
                    ast.FilterKey = "IS";
                    if (typeof filtervalue(Object.keys(filtervalue)[0]) !== "string") {
                        throw new InsightError("Invalid value type in IS , should be string");
                    } else {
                        ast.value = [s[0], s[1], filtervalue(Object.keys(filtervalue)[0])];
                    }
                }
            }
        }
    }
    public NegationTraverse(filtervalue: any, ast: IFilter) {
        if (typeof filtervalue !== "object" || Array.isArray(filtervalue)) {
            throw new InsightError("Invalid query string");
        } else if (Object.keys(filtervalue).length !== 1) {
            throw new InsightError("NOT should only have 1 key, has " + Object.keys(filtervalue).length + " .");
        } else {
            ast.FilterKey = "NOT";
            ast.nodes.length = 1; // ast.FilterKey.value = filtervalue;
            ast.nodes.push(filtervalue);
            this.traverseFilterGenAst(filtervalue, ast.nodes[0]);
        }
    }
    public getStringToFrst_(key: string, element: string) {
        let re;
        if (element === "LT" || "GT" || "EQ") {
            re = new RegExp(/[^_]+_(avg|pass|fail|audit|year)$/g);
        } else {
            re = new RegExp(/[^_]+_(dept|id|instructor|title|uuid)$/g);
        }
        let s = key.match(re);
        if (s.length !== 1) {
            throw new InsightError("key doesn't match");
        } else if (s[0] !== key) {
            throw new InsightError("key doesn't match");
        } else {
            return;
        }
    }
    public astApplyToRow(currentdatabasename: string, addHash: IHash) {
        if (!addHash[currentdatabasename]) {
            throw new InsightError("Referenced dataset " + currentdatabasename + " not added yet");
        }
        this.rowsbeforeoption = this.traverseAst(this.AST, currentdatabasename, addHash);
    }
    public traverseAst(ast: IFilter, databasename: string, addHash: IHash): any[] {
        this.allrows = addHash[databasename];
        function traverseArray(nodes: IFilter[], identifier: string): any[] {
            let midresult: any[] = [];
            if (identifier === "AND") {
                nodes.forEach((child) => {
                    midresult = this.keepcommon(midresult, traverseNode(child));
                });
            } else if (identifier === "OR") {
                nodes.forEach((child) => {
                    midresult = this.keepboth(midresult, traverseNode(child));
                });
            } else if (identifier === "NOT") {
                nodes.forEach((child) => {
                    midresult = this.reverse(traverseNode(child));
                });
            }
            return midresult;
        }
        function traverseNode(current: IFilter): any[] {
            let midresult: any[] = [];
            let identifier = current.FilterKey;
            if (identifier === "AND" || "OR" || "NOT") {
                midresult = traverseArray(current.nodes, identifier);
            } else if (identifier === "EQ" || "GT" || "LT" || "IS") {
                let value = current.value;
                let assert = require("assert");
                assert(value[0] === this.currentdatabasename);
                switch (identifier) {
                    case "EQ":
                        midresult = this.selectrowM(value[1], value[2], "EQ", databasename);
                        break;
                    case "GT":
                        midresult = this.selectrowM(value[1], value[2], "GT", databasename);
                        break;
                    case "LT":
                        midresult = this.selectrowM(value[1], value[2], "LT", databasename);
                        break;
                    case "IS":
                        midresult = this.selectrowS(value[1], value[2]);
                        break;
                }
            }
            return midresult;
        }
        let result = traverseNode(ast);
        return result;
    }
    public keepcommon(array1: any[], array2: any[]): any[] {
        if (array1.length !== 0 && array2.length !== 0) {
            let set = new Set();
            let ret: any[] = [];
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
        return [];
    }
    public keepboth(array1: any[], array2: any[]) {
        if (array1.length === 0) {
            return array2;
        } else if (array2.length === 0) {
            return array1;
        } else {
            let ret = array1;
            array2.forEach((element) => {
                if (!ret.includes(element)) {
                    ret.push(element);
                }
            });
            return ret;
        }
    }
    public reverse(array1: any[]) {
        if (array1.length === 0) {
            return this.allrows;
        } else {
            let set = new Set();
            let ret: any[] = [];
            array1.forEach((element) => {
                set.add(element);
            });
            this.allrows.forEach((element) => {
                if (!set.has(element)) {
                    ret.push(element);
                }
            });
            return ret;
        }
    }
    public selectrowM(key: string, value: number, identifier: string): any[] {
        let ret: any[] = [];
        switch (identifier) {
            case "EQ":
            this.allrows.forEach((element) => {
                if (element.hasOwnProperty(key) && element.key === value) {
                    ret.push(element);
                }
            });
            break;
            case "GT":
            this.allrows.forEach((element) => {
                if (element.hasOwnProperty(key) && element.key > value) {
                    ret.push(element);
                }
            });
            break;
            case "LT":
            this.allrows.forEach((element) => {
                if (element.hasOwnProperty(key) && element.key < value) {
                    ret.push(element);
                }
            });
            break;
            default: break;
        }
        return ret;
    }
    public selectrowS(key: string, value: string): any[] {
        let ret: any[] = [];
        this.allrows.forEach((element) => {
            let regexp = new RegExp(/^[*]?[^*]*[*]?$/g);
            let s = value.match(regexp);
            if (s.length !== 1) {
                throw new InsightError("key doesn't match");
            } else if (s[0] !== value) {
                throw new InsightError("key doesn't match");
            } else {
                let s2 = element[key].match(regexp);
                if (s2.length === 1 && s2[0] === element[key]) {
                    ret.push(element);
                }
            }
        });
        return ret;
    }
    public applyOptions() {
        this.rowsbeforeoption.forEach((element) => {
            Object.keys(element).forEach((keytoexamine) => {
                if (!this.columnstoshow.has(keytoexamine)) {
                    delete element.keytoexamine;
                }
            });
        });
        this.sortrows();
    }
    public sortrows() {
        if (this.order !== undefined) {
            this.rowsbeforeoption.sort(function (a, b) {
                let A = a[this.order];
                let B = b[this.order];
                if (A < B) {return -1; }
                if (A > B) {return 1; }
                return 0;
            });
        } else {
            return;
        }
    }
    public clean() {
        this.currentdatabasename = undefined;
        this.AST = null;
        this.rowsbeforeoption = null;
        this.columnstoshow.forEach((element) => {
            this.columnstoshow.delete(element);
        });
    }
}
