import * as JSZip from "jszip";
import * as fs from "fs-extra";
import restify = require("restify");
import {InsightError, NotFoundError, InsightDatasetKind} from "../controller/IInsightFacade";
import InsightFacade from "../controller/InsightFacade";

// // 1====submit a zip file that will be parsed and used for future queries
// that.rest.put("/dataset/:id/:kind", );

// // 2====deletes the existing dataset stored.
// that.rest.del("/dataset/:id/:kind", );

// // 3====sends the query to the application. The query will be in JSON format in the post body.
// that.rest.post("/query", );

// // 4====returns a list of datasets that were added.
// that.rest.get("/datasets", );

export default class Handlers {
    private insightFacade: InsightFacade = new InsightFacade();

    // // 1====submit a zip file that will be parsed and used for future queries
    public async putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        let id: string = req.params.id;
        let kind: InsightDatasetKind = req.params.kind;
        let body = new Buffer(req.params.body).toString("base64");
        try {
            let reply = await this.insightFacade.addDataset(id, body, kind);
            res.send(200, reply);
        } catch (err) {
            res.send(400, err.message);
        }
        next();
    }
    // // 2====deletes the existing dataset stored.
    public async delDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        let id = req.params.id;
        try {
            let reply = await this.insightFacade.removeDataset(id);
            res.send(200, reply);
        } catch (err) {
            if (err instanceof InsightError) {
                res.send(400, err.message);
            } else {
                res.send(404, err.message);
            }
        }
        next();
    }

    // // 3====sends the query to the application. The query will be in JSON format in the post body.
    public async postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        let query = req.params.query;
        if (!this.insightFacade.datasetsHash) {
            res.send(400, "No dataset added!");
        }
        try {
            let reply = this.insightFacade.performQuery(query);
            res.send(200, reply);
        } catch (err) {
            res.send(400, err.message);
        }
        next();
    }

    // // 4====returns a list of datasets that were added.
    public async getDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        try {
            let reply = this.insightFacade.listDatasets();
            res.send(200, reply);
        } catch (err) {
            res.send(400, err.message);
        }
        next();
    }

}
