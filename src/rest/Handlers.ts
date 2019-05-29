// /* tslint:disable:no-console */
// import * as JSZip from "jszip";
// import * as fs from "fs-extra";
// import restify = require("restify");
// import {InsightError, NotFoundError, InsightDatasetKind} from "../controller/IInsightFacade";
// import InsightFacade from "../controller/InsightFacade";
// import Log from "../Util";

// // // 1====submit a zip file that will be parsed and used for future queries
// // that.rest.put("/dataset/:id/:kind", );

// // // 2====deletes the existing dataset stored.
// // that.rest.del("/dataset/:id/:kind", );

// // // 3====sends the query to the application. The query will be in JSON format in the post body.
// // that.rest.post("/query", );

// // // 4====returns a list of datasets that were added.
// // that.rest.get("/datasets", );

// export default class Handlers {
//     private insightFacade: InsightFacade;

//     constructor() {
//         Log.info("Initializing Handler Instance!!!");
//         this.insightFacade = new InsightFacade();
//     }

//     // // 1====submit a zip file that will be parsed and used for future queries
//     public async putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {

//          // ** code partially removed to adhere to collaboration policy
// // * and to benefit future cohorts */
//     }
//     // // 2====deletes the existing dataset stored.
//     public async delDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
//         // ** code partially removed to adhere to collaboration policy
// // * and to benefit future cohorts */
//     }
//     // // 3====sends the query to the application. The query will be in JSON format in the post body.
//     public async postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
//         // ** code partially removed to adhere to collaboration policy
// // * and to benefit future cohorts */
//     }

//     // // 4====returns a list of datasets that were added.
//     public async getDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
//         Log.info(req.method + " " + req.url);
//         try {
//             let reply = await this.insightFacade.listDatasets();
//             res.json(200, {result: reply});
//         } catch (err) {
//             res.json(400, {error: err.message});
//         }
//         return next();
//     }
// }
