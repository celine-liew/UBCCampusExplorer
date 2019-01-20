import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";

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
            } catch (e) {
                reject(e);
            }
            let rowsbeforeoption: object[] = [];
            try {
                rowsbeforeoption = this.traversewherevalue(query,dataset);
            } catch (e) {
                reject(e);
            }
            let finalresult: string[] = [];
            try {
                finalresult = this.applyoptions(rowsbeforeoption,query["OPTIONS"]);
            } catch (e) {
                reject (e);
            }
            resolve(finalresult);
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
                this.validateWhere(queryobj["WHERE"]);
                this.validataOptions(queryobj["OPTIONS"]);
            }
        }

    }
    public validateWhere(wherepart:any){
        if (typeof wherepart !== "object"){
            throw new InsightError("Where must be an object");
        } else if (wherepart.length === 0){
            throw new InsightError("Where must be non-empty");
        } else if (Object.keys(wherepart).length > 1){
            throw new InsightError("Excess keys in where");
        } else {
            return;
        }
    }
    public validataOptions(optionpart:any){
        if (typeof optionpart !== "object") {
            throw new InsightError("Options must be an object");
        } else {
            let keys = Object.keys(optionpart);
            if (keys.length > 3) {
                throw new InsightError("Excess keys in options");
            } else if (!optionpart.hasOwnProperty("COLUMNS")) {
                throw new InsightError("Missing Columns");
            } else if (keys.length === 2 && !optionpart.hasOwnProperty("ORDER")){
                throw new InsightError("Invalid keys in OPTIONS");
            }
        }
    }
    public listDatasets(): Promise<InsightDataset[]> {
        return Promise.reject("Not implemented.");
    }
}
