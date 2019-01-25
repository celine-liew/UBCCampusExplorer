import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind, ResultTooLargeError} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import { AssertionError } from "assert";
import Queryparser from "./queryparser";
import { acceptParser } from "restify";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */

export default class InsightFacade implements IInsightFacade {
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
                let queryobj = JSON.parse(query);
                this.validateWhere(queryobj["WHERE"]);
                this.validateOptions(queryobj["OPTIONS"]);
                let parser = new Queryparser();
                parser.traverseFilterGenAst(queryobj["WHERE"], this.ast);
                parser.astApplyToRow(this.ast, this.currentdatabasename);
                parser.applyOptions();
                let finalresult = parser.getresult();
            } catch (error) {
                if (error instanceof InsightError) {
                    reject(error);
                } else {
                    reject (new InsightError(error));
                }
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
            } else if (optionpart.hasOwnProperty("ORDER") && typeof optionpart["ORDER"] !== "string") {
                throw new InsightError("Invalid ORDER type");
            } else if (!Array.isArray(optionpart["COLUMNS"])) {
                throw new InsightError("Invalid query string");
            } else {
                optionpart["COLUMNS"].forEach((element: any) => {
                    if (typeof element !== "string") {
                        throw new InsightError("Invalid query string");
                    }
                });
                this.checkcolumns(optionpart["COLUMNS"]);
                if (optionpart["ORDER"]) {
                    this.checkorder(optionpart["COLUMNS"], optionpart["ORDER"]);
                }
                return;
            }
        }
    }
    public checkcolumns(columns: string[]) {
        columns.forEach((element) => {
            let re = new RegExp(/[^_]+_(avg|pass|fail|audit|year|dept|id|instructor|title|uuid)$/g);
            let s = element.match(re);
            if (s.length !== 1) {
                throw new InsightError("key doesn't match");
            } else if (s[0] !== element) {
                throw new InsightError("key doesn't match");
            } else {
                if ( Queryparser.getcurrentdataset() === undefined) {
                    Queryparser.setcurrentdataset(s[0]);
                } else if (Queryparser.getcurrentdataset() !== s[0]) {
                    throw new InsightError("Cannot query more than one dataset");
                } else {
                    Queryparser.columnstoshowpush(element);
                }
                return;
            }
        });
    }
    public checkorder(columns: any[], order: string) {
        columns.forEach((element) => {
            if (element === order) {
                return;
            }
        });
        throw new InsightError("ORDER key must be in COLUMNS");
    }

    public listDatasets(): Promise<InsightDataset[]> {
        return Promise.reject("Not implemented.");
    }
}
