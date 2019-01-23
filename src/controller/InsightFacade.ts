import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import { AssertionError } from "assert";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */

export default class InsightFacade implements IInsightFacade {
    private ast: IFilter;
    private rowsbeforeoption: object[] = [];
    private finalresult: string[] = [];
    private data: InsightDataset[];
    private currentdatabasename: string = undefined;
    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        return Promise.reject("Not implemented.");
    }

    public removeDataset(id: string): Promise<string> {
        return Promise.reject("Not implemented.");
    }

    public performQuery(query: any): Promise <any[]> {
        const promise: Promise<string[]> = new Promise(function (resolve, reject) {
            try {
                this.validatequery(query);
            } catch (e) {
                reject(e);
            }
            try {
                let queryobj = JSON.parse(query);
                this.validateWhere(queryobj["WHERE"]);
                this.validateOptions(queryobj["OPTIONS"]);
                this.traverseFilterGenAst(queryobj["WHERE"], this.ast);
                this.astGenLogicFormula(this.ast, this.currentdatabasename);
                this.applyOptions(queryobj["OPTIONS"]);
                this.currentdatabasename = undefined;
                this.ast = null;
                this.rowsbeforeoption = null;
                this.finalresult = null;
            } catch (e) {
                reject (e);
            }
            resolve(this.finalresult);
        });
        return promise;
    }
    public validatequery(query: any) {
        let queryobj: object;
        try {
            queryobj = JSON.parse(query);
        } catch (e) {
            throw new InsightError("Invalid query string");
        }
        let keys: string[] = [];
        // this function gets all the keys as an array of queryobj
        keys = Object.keys(queryobj);
        // if the queryobj has more than three keys, it must be invalid
        if (keys.length >= 3) {
            throw new InsightError("Excess keys in query");
        } else {
            if (!queryobj.hasOwnProperty("WHERE")) {
                throw new InsightError("Missing Where");
            } else if (!queryobj.hasOwnProperty("OPTIONS")) {
                throw new InsightError("Missing Options");
            } else if (!(query["OPTIONS"].hasOwnProperty("COLUMNS"))) {
                throw new InsightError("Options Missing Columns");
            } else if (query["OPTIONS"]["COLUMNS"].length <= 0) {
                throw new InsightError("Columns must be an un-empty array");
            } else {
                return;
            }
        }
    }
    public validateWhere(wherepart: any) {
        if (typeof wherepart !== "object") {
            throw new InsightError("Where must be an object");
        } else if (wherepart.length === 0) {
            throw new InsightError("Where must be non-empty");
        } else if (Object.keys(wherepart).length > 1) {
            throw new InsightError("Excess keys in where");
        } else {
            return;
        }
    }
    public validateOptions(optionpart: any) {
        if (typeof optionpart !== "object") {
            throw new InsightError("Options must be an object");
        } else {
            let keys = Object.keys(optionpart);
            if (keys.length >= 3) {
                throw new InsightError("Excess keys in options");
            } else if (!optionpart.hasOwnProperty("COLUMNS")) {
                throw new InsightError("Missing Columns");
            } else if (keys.length === 2 && !optionpart.hasOwnProperty("ORDER")) {
                throw new InsightError("Invalid keys in OPTIONS");
            } else {
                return;
            }
        }
    }
    public traverseFilterGenAst(filter: any, ast: IFilter) {
        let element = Object.keys(filter)[0];
        switch (element) {
            case LogicOperator.AND:
            case LogicOperator.OR:
                this.logicSymbolTraverse(filter[element], ast, element);
            case MathOperator.LT:
            case MathOperator.GT:
            case MathOperator.EQ:
            case "IS": // TODO wild cards!!
                this.MSSymbolTraverse(filter[element], ast, element);
            case "NOT":
                if (typeof filter[element] !== "object" || Array.isArray(filter[element])) {
                    throw new InsightError("Invalid query string");
                } else {
                    ast.FilterKey.keytype = "NOT";
                    ast.nodes.length = 1;
                    ast.nodes.push(filter[element]);
                    this.traverseFilterGenAst(filter[element], ast.nodes[0]);
                }
            default:
                throw new InsightError("Invalid query string");
        }
    }
    public logicSymbolTraverse(filtervalue: any, ast: IFilter, element: string) {
        if (!Array.isArray(filtervalue) || filtervalue.length === 0) {
            throw new InsightError(element + " must be a non-empty array.");
        }
        let key: LogicOperator = LogicOperator[element];
        ast.FilterKey.keytype = key; // ast.nodes.length = filter[element].length;
        for (let eachfilter of filtervalue) {
            if (typeof eachfilter !== "object") {
                throw new InsightError(element + " must be object.");
            }
            // ast.FilterKey.value.push(eachfilter);
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
                throw new InsightError("Cannot query more than one dataset");
            } else {
                ast.nodes.length = 0;
                if (element === MathOperator.LT || MathOperator.GT || MathOperator.EQ) {
                    ast.FilterKey.keytype = MathOperator[element];
                    if (typeof filtervalue(Object.keys(filtervalue)[0]) !== "number") {
                        throw new InsightError("Invalid value type in " + element + " , should be number");
                    } else {
                        ast.FilterKey.value = [s[0], s[1], filtervalue(Object.keys(filtervalue)[0])];
                    }
                } else {
                    ast.FilterKey.keytype = "IS";
                    if (typeof filtervalue(Object.keys(filtervalue)[0]) !== "string") {
                        throw new InsightError("Invalid value type in IS , should be string");
                    } else {
                        ast.FilterKey.value = [s[0], s[1], filtervalue(Object.keys(filtervalue)[0])];
                    }
                }
            }
        }
    }
    public getStringToFrst_(key: string, element: string) {
        let re;
        if (element === MathOperator.LT || MathOperator.GT || MathOperator.EQ) {
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
    public astGenLogicFormula(ast: IFilter, currentdatabasename: string) {
        if (!Object.keys(this.data).includes(currentdatabasename)) {
            throw new InsightError("Referenced dataset " + currentdatabasename + " not added yet");
        }
        this.rowsbeforeoption = null;
    }
    public applyOptions(optionpart: any) {
        this.finalresult = null;
    }
    public listDatasets(): Promise<InsightDataset[]> {
        return Promise.reject("Not implemented.");
    }
}
