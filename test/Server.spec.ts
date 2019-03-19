import Server from "../src/rest/Server";
import TestUtil from "./TestUtil";
import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
import chai = require("chai");
import { expect } from "chai";
import chaiHttp = require("chai-http");
import { InsightDatasetKind } from "../src/controller/IInsightFacade";

describe("Facade D3", function () {

    let facade: InsightFacade = null;
    let server: Server = null;

    chai.use(chaiHttp);

    before(function () {
        facade = new InsightFacade();
        server = new Server(4321);

        try {
            return server.start();
        } catch (err) {
            expect. fail("fail to start the server");
        }

        // TODO: start server here once and handle errors properly
    });

    after(function () {
        // TODO: stop server here once!
        return server.stop();
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);

        // might want to add some process logging here to keep track of what"s going on
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
        // might want to add some process logging here to keep track of what"s going on
    });

    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        rooms: "./test/data/rooms.zip"
    };
    let datasets: { [id: string]: string };
    before(async function () {
        // TODO: read your courses and rooms datasets here once!
        const loadDatasetPromises: Array<Promise<Buffer>> = [];
        for (const [id, path] of Object.entries(datasetsToLoad)) {
            loadDatasetPromises.push(TestUtil.readFileAsync(path));
        }
        const loadedDatasets = (await Promise.all(loadDatasetPromises)).map((buf, i) => {
            return { [Object.keys(datasetsToLoad)[i]]: buf.toString("base64") };
        });
        datasets = Object.assign({}, ...loadedDatasets);
        facade.addDataset("courses", datasets["courses"], InsightDatasetKind.Courses);
        facade.addDataset("rooms", datasets["rooms"], InsightDatasetKind.Rooms);
    });
    // Hint on how to test PUT requests

    it("PUT test for courses dataset", function () {
        try {
            // return chai.request("http://localhost:4321")
            //     .put("/dataset/smalldataset/courses")
            //     .attach("body", datasets["smalldataset"], "./test/data/smalldataset.zip")
            //     .then(function (res: Response) {
            //         // some logging here please!
            //         res = await facade.addDataset()
            //         expect(res.status).to.be.equal(204);
            //     })
            //     .catch(function (err) {
            //         // some logging here please!
            //         expect.fail();
            //     });

        } catch (err) {
            // and some more logging here!
        }
    });

    // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
