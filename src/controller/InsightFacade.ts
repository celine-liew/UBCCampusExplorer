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
            let queryobj: object;
            try {
                queryobj = JSON.parse(query);
            } catch (e) {
                throw new InsightError("Invalid query string");
            }
            let tree: AST;
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
                    let wherevalid = await InsightFacade.validateWhere(queryobj["WHERE"]);
                    let optionsvalid = await InsightFacade.validataOptions(queryobj["OPTIONS"]);
                    // if(where)
                }
            }

        });
        return promise;
    }

    public listDatasets(): Promise<InsightDataset[]> {
        return Promise.reject("Not implemented.");
    }
}
