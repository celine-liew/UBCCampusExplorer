import * as JSZip from "jszip";
import * as fs from "fs-extra";
import restify = require("restify");
import {InsightError, NotFoundError, InsightDatasetKind} from "../controller/IInsightFacade";
import InsightFacade from "../controller/InsightFacade";
import Log from "../Util";

// // 1====submit a zip file that will be parsed and used for future queries
// that.rest.put("/dataset/:id/:kind", );

// // 2====deletes the existing dataset stored.
// that.rest.del("/dataset/:id/:kind", );

// // 3====sends the query to the application. The query will be in JSON format in the post body.
// that.rest.post("/query", );

// // 4====returns a list of datasets that were added.
// that.rest.get("/datasets", );

export default class Handlers {
    private insightFacade: InsightFacade;

    // // 1====submit a zip file that will be parsed and used for future queries
    public async putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        let id: string = req.params.id;
        let kind: InsightDatasetKind = req.params.kind;
        let body = Buffer.from(req.params.body).toString("base64");
        Log.info(id + " " + kind);
        // Log.info(body);
        this.insightFacade = new InsightFacade();
        try {
            let value = await this.insightFacade.addDataset(id, body, kind);
            res.send(200, {result: value});
        } catch (err) {
            res.send(400, {error: err.message});
        }
        return next();
    }
    // // 2====deletes the existing dataset stored.
    public async delDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        let id = req.params.id;
        this.insightFacade = new InsightFacade();
        try {
            let reply = await this.insightFacade.removeDataset(id);
            res.send(200, {result: reply});
        } catch (err) {
            if (err instanceof InsightError) {
                res.send(400, {error: err.message});
            } else if (err instanceof NotFoundError) {
                res.send(404, {error: err.message});
            }
        }
        return next();
    }

    // // 3====sends the query to the application. The query will be in JSON format in the post body.
    public async postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        let query = req.body;
        this.insightFacade = new InsightFacade();
        if (!this.insightFacade.datasetsHash) {
            res.send(400, {error: "No dataset added!"});
        }
        try {
            let reply = this.insightFacade.performQuery(query);
            res.send(200, {result: reply});
        } catch (err) {
            res.send(400, {error: err.message});
        }
        return next();
    }

    // // 4====returns a list of datasets that were added.
    public async getDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        try {
            this.insightFacade = new InsightFacade();
            let reply = this.insightFacade.listDatasets();
            res.send(200, {result: reply});
        } catch (err) {
            res.send(400, {error: err.message});
        }
        return next();
    }

}
