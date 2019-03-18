import Server from "../src/rest/Server";
import TestUtil from "./TestUtil";
import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
import chai = require("chai");
import { expect } from "chai";
import chaiHttp = require("chai-http");
import { InsightDatasetKind } from "../src/controller/IInsightFacade";
import { doesNotReject } from "assert";
import * as fs from "fs";

describe("Facade D3", function () {

    let facade: InsightFacade = null;
    let server: Server = null;
    chai.use(chaiHttp);

    before(function () {
        facade = new InsightFacade();
        server = new Server(4321);

        try {
            server.start().then((success) => {
                if (success) {
                    Log.test(`Has Started the Server!!`);
                } else {
                    Log.test(`Has not Started the Server!!`);
                }
            });
        } catch (err) {
            Log.error(err);
            expect. fail("fail to start the server");
        }

        // TODO: start server here once and handle errors properly
    });

    after(function () {
        // TODO: stop server here once!
        server.stop().then(() => {
            Log.test(`Has stopped the Server!!`);
        });
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);

        // might want to add some process logging here to keep track of what"s going on
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
        // might want to add some process logging here to keep track of what"s going on
    });

    // const datasetsToLoad: { [id: string]: string } = {
    //     courses: "./test/data/courses.zip",
    //     rooms: "./test/data/rooms.zip",
    //     smalldataset: "./test/data/smalldataset.zip",
    //     notZIP: "./test/data/notZIP.txt",
    //     zerosection: "./test/data/zerosectionsdataset.zip",
    //     invalidjson2: "./test/data/invalidjson2.zip",
    //     cpsccourses2: "./test/data/cpsccourses2.zip"
    // };
    // let datasets: { [id: string]: string };
    // before (async function () {
    //     // TODO: read your courses and rooms datasets here once!
    //     const loadDatasetPromises: Array<Promise<Buffer>> = [];
    //     for (const [id, path] of Object.entries(datasetsToLoad)) {
    //         loadDatasetPromises.push(TestUtil.readFileAsync(path));
    //     }
    //     const loadedDatasets = (await Promise.all(loadDatasetPromises)).map((buf, i) => {
    //         return { [Object.keys(datasetsToLoad)[i]]: buf.toString("base64") };
    //     });
    //     datasets = Object.assign({}, ...loadedDatasets);
    //     await facade.addDataset("courses", datasets["courses"], InsightDatasetKind.Courses);
    //     await facade.addDataset("rooms", datasets["rooms"], InsightDatasetKind.Rooms);
    //     // await facade.addDataset("cpsccourses2", datasets["cpsccourses2"], InsightDatasetKind.Courses);
    // });
    // Hint on how to test PUT requests

    it("PUT test for courses dataset", function () {
        try {
            let file = "./test/data/courses.zip";
            Log.info(file);
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .attach("body", fs.readFileSync(file), "courses.zip")
                .then(
                    (res) => {
                    Log.test(`PUT test for courses dataset OK`);
                    expect(res.status).to.be.equal(200);
                    // Expect length of list of datasets to be three?????
                    }
                )
                .catch(function (err: any) {
                    // some logging here please!
                    Log.info(err);
                    expect.fail("Put dataset should not fail if the implementation is correct");
                });
        } catch (err) {
            expect.fail("PUT test for courses dataset should be OK");
            // and some more logging here!
        }
    });

    // it("PUT duplicate courses dataset should reject", function () {
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .put("/dataset/courses/courses")
    //             .attach("body", datasets["courses"], "./test/data/courses.zip")
    //             .then(
    //                 (res) => {
    //                 Log.test(`PUT test for duplicate courses dataset should be rejected`);
    //                 expect(res.status).to.be.equal(400);
    //                 // Expect length of list of datasets to be three?????
    //                 }
    //             )
    //             .catch(function (err: any) {
    //                 // some logging here please!
    //                 expect.fail("Put dataset should not fail if the implementation is correct");
    //             });
    //     } catch (err) {
    //         Log.test(`PUT test for duplicate courses dataset should be rejected`);
    //         // expect.fail("PUT test for courses dataset should be OK");
    //         // and some more logging here!
    //     }
    // });

    // it("PUT invalid courses dataset should reject - wrong content", function () {
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .put("/dataset/courses/courses")
    //             .attach("body", datasets["rooms"], "./test/data/courses.zip")
    //             .then(
    //                 (res) => {
    //                 Log.test(`PUT test for wrong content in courses dataset should be rejected`);
    //                 // Expect length of list of datasets to be three?????
    //                 }
    //             )
    //             .catch(function (res: any) {
    //                 // some logging here please!
    //                 expect(res.status).to.be.equal(400);
    //                 expect.fail("Put dataset should not fail if the implementation is correct");
    //             });
    //     } catch (err) {
    //         expect.fail("PUT test for courses dataset should be OK");
    //         // and some more logging here!
    //     }
    // });

    // it("PUT invalid courses dataset should reject - wrong path", function () {
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .put("/dataset/courses/courses")
    //             .attach("body", datasets["courses"], "./test/data/rooms.zip")
    //             .then(
    //                 (res) => {
    //                 Log.test(`PUT test for wrong path in courses dataset should be rejected`);
    //                 expect(res.status).to.be.equal(400);
    //                 // Expect length of list of datasets to be three?????
    //                 }
    //             )
    //             .catch(function (err: any) {
    //                 // some logging here please!
    //                 expect.fail("Put dataset should not fail if the implementation is correct");
    //             });
    //     } catch (err) {
    //         expect.fail("PUT test for courses dataset should be OK");
    //         // and some more logging here!
    //     }
    // });
    // it("PUT invalid courses dataset should reject - wrong URI", function () {
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .put("/dataset/courses/rooms")
    //             .attach("body", datasets["courses"], "./test/data/courses.zip")
    //             .then(
    //                 (res) => {
    //                 Log.test(`PUT test for wrong URI in courses dataset should be rejected`);
    //                 expect(res.status).to.be.equal(400);
    //                 // Expect length of list of datasets to be three?????
    //                 }
    //             )
    //             .catch(function (err: any) {
    //                 // some logging here please!
    //                 expect.fail("Put dataset should not fail if the implementation is correct");
    //             });
    //     } catch (err) {
    //         expect.fail("PUT test for courses dataset should be OK");
    //         // and some more logging here!
    //     }
    // });
    // it("PUT invalid courses dataset should reject - Not zip", function () {
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .put("/dataset/notZIP/courses")
    //             .attach("body", datasets["notZIP"], "./test/data/notZIP.txt")
    //             .then(
    //                 (res) => {
    //                 Log.test(`PUT test for Not zip in courses dataset should be rejected`);
    //                 expect(res.status).to.be.equal(400);
    //                 // Expect length of list of datasets to be three?????
    //                 }
    //             )
    //             .catch(function (err: any) {
    //                 // some logging here please!
    //                 expect.fail("Put dataset should not fail if the implementation is correct");
    //             });
    //     } catch (err) {
    //         expect.fail("PUT test for courses dataset should be OK");
    //         // and some more logging here!
    //     }
    // });
    // it("PUT invalid courses dataset should reject - Zero section", function () {
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .put("/dataset/zerosection/courses")
    //             .attach("body", datasets["zerosection"], "./test/data/zerosectionsdataset.zip")
    //             .then(
    //                 (res) => {
    //                 Log.test(`PUT test for Zero section in courses dataset should be rejected`);
    //                 expect(res.status).to.be.equal(400);
    //                 // Expect length of list of datasets to be three?????
    //                 }
    //             )
    //             .catch(function (err: any) {
    //                 // some logging here please!
    //                 expect.fail("Put dataset should not fail if the implementation is correct");
    //             });
    //     } catch (err) {
    //         expect.fail("PUT test for courses dataset should be OK");
    //         // and some more logging here!
    //     }
    // });
    // it("PUT invalid courses dataset should reject - Bad json", function () {
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .put("/dataset/invalidjson2/courses")
    //             .attach("body", datasets["invalidjson2"], "./test/data/invalidjson2.zip")
    //             .then(
    //                 (res) => {
    //                 Log.test(`PUT test for bad json in courses dataset should be rejected`);
    //                 expect(res.status).to.be.equal(400);
    //                 // Expect length of list of datasets to be three?????
    //                 }
    //             )
    //             .catch(function (err: any) {
    //                 // some logging here please!
    //                 expect.fail("Put dataset should not fail if the implementation is correct");
    //             });
    //     } catch (err) {
    //         expect.fail("PUT test for courses dataset should be OK");
    //         // and some more logging here!
    //     }
    // });
    // it("del test for dataset", function () {
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .del("/dataset/cpsccourses2/courses")
    //             .then(
    //                 (res) => {
    //                 Log.test(`DEL test for cpsccourses2 should be OK`);
    //                 expect(res.status).to.be.equal(200);
    //                 }
    //             )
    //             .catch(function (err: any) {
    //                 // some logging here please!
    //                 expect.fail("DEL dataset should not fail if the implementation is correct");
    //             });
    //     } catch (err) {
    //         expect.fail("DEL test for courses dataset should be OK");
    //         // and some more logging here!
    //     }
    // });
    // it("del test for dataset - deletetwice", async function () {
    //     try {
    //         await facade.removeDataset("cpsccourses2");
    //         return chai.request("http://localhost:4321")
    //             .del("/dataset/cpsccourses2/courses")
    //             .then(
    //                 (res) => {
    //                 Log.test(`DEL test for cpsccourses2 twice should be rejected`);
    //                 expect(res.status).to.be.equal(400);
    //                 }
    //             )
    //             .catch(function (err: any) {
    //                 // some logging here please!
    //                 expect.fail("DEL dataset should not fail if the implementation is correct");
    //             });
    //     } catch (err) {
    //         expect.fail("DEL test for courses dataset should be OK");
    //         // and some more logging here!
    //     }
    // });
    // it("del test for dataset - delete not added", function () {
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .del("/dataset/notadded/courses")
    //             .then(
    //                 (res) => {
    //                 Log.test(`DEL test for not added set should be rejected`);
    //                 expect(res.status).to.be.equal(400);
    //                 }
    //             )
    //             .catch(function (err: any) {
    //                 // some logging here please!
    //                 expect.fail("DEL dataset should not fail if the implementation is correct");
    //             });
    //     } catch (err) {
    //         expect.fail("DEL test for courses dataset should be OK");
    //         // and some more logging here!
    //     }
    // });
    // it("get test for dataset - ", function () {
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .get("/dataset")
    //             .then(
    //                 (res) => {
    //                 Log.test(`GET test should be OK`);
    //                 expect(res.status).to.be.equal(200);
    //                 }
    //             )
    //             .catch(function (err: any) {
    //                 // some logging here please!
    //                 expect.fail("GET dataset should not fail if the implementation is correct");
    //             });
    //     } catch (err) {
    //         expect.fail("GET test for courses dataset should be OK");
    //         // and some more logging here!
    //     }
    // });
    // it("POST query ", function () {
    //     // try {
    //     //     return chai.request("http://localhost:4321")
    //     //         .post("/query")
    //     //         .attach()
    //     //         .then(
    //     //             (res) => {
    //     //             Log.test(`GET test should be OK`);
    //     //             expect(res.status).to.be.equal(200);
    //     //             }
    //     //         )
    //     //         .catch(function (err: any) {
    //     //             // some logging here please!
    //     //             expect.fail("GET dataset should not fail if the implementation is correct");
    //     //         });
    //     // } catch (err) {
    //     //     expect.fail("GET test for courses dataset should be OK");
    //     //     // and some more logging here!
    //     // }
    // });
    // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
