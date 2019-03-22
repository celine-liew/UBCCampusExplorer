// tslint:disable
import Server from "../src/rest/Server";
import TestUtil from "./TestUtil";
import Log from "../src/Util";
import InsightFacade from "../src/controller/InsightFacade";
import chai = require("chai");
import { expect } from "chai";
import chaiHttp = require("chai-http");
import { InsightDatasetKind } from "../src/controller/IInsightFacade";
import * as fs from "fs";
import { ITestQuery } from "./InsightFacade.spec";
import { NotFoundError } from "restify";

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
            expect.fail("fail to start the server");
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
    // Hint on how to test PUT requests
    it("PUT test for courses dataset", async function () {
        try {
            let file = "./test/data/courses.zip";
            // Log.info(file);
            let buffer = await TestUtil.readFileAsync(file);
            // Log.info(`=====================`);
            // console.log(Buffer.isBuffer(buffer));
            // Log.info(`=====================`);
            // let buffer: Buffer = new Buffer(fs.readFileSync(file));
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .attach("body", buffer, "courses.zip")
                .then(
                    (res) => {
                    Log.test(`PUT test for courses dataset OK`);
                    expect(res.status).to.be.equal(200);
                    expect(res.body["result"]).to.deep.include("courses");
                    }
                )
                .catch(function (err: any) {
                    // some logging here please!
                    Log.info(err.status);
                    Log.info(err.body);
                    // Log.info(err);
                    expect.fail("Put dataset should not fail if the implementation is correct");
                });
        } catch (err) {
            expect.fail("PUT test for courses dataset should be OK");
            // and some more logging here!
        }
    });

    it("PUT test for room dataset", async function () {
        try {
            let file = "./test/data/rooms.zip";
            Log.info(file);
            let buffer = await TestUtil.readFileAsync(file);
            return chai.request("http://localhost:4321")
                .put("/dataset/rooms/rooms")
                .attach("body", buffer, "rooms.zip")
                .then(
                    (res) => {
                    Log.test(`PUT test for rooms dataset OK`);
                    expect(res.status).to.be.equal(200);
                    expect(res.body["result"]).to.deep.include("rooms");
                        // Expect length of list of datasets to be three?????
                    }
                )
                .catch(function (err: any) {
                    // some logging here please!
                    // Log.info(err);
                    // expect(err.status).to.be.equal(400);
                    expect.fail("Put dataset should not fail if the implementation is correct");
                });
        } catch (err) {
            expect.fail("PUT test for rooms dataset should be OK");
            // and some more logging here!
        }
    });

    // it("PUT invalid courses dataset should reject - wrong content", function () {
    //     try {
    //         let file = "./test/data/rooms.zip";
    //         return chai.request("http://localhost:4321")
    //             .put("/dataset/courses/courses")
    //             .attach("body", fs.readFileSync(file), "./test/data/courses.zip")
    //             .then(
    //                 (res) => {
    //                 Log.test(`PUT test for wrong content in courses dataset should be rejected`);
    //                 expect(res.status).to.be.equal(400);
    //                 }
    //             );
    //     } catch (err) {
    //         expect.fail("should not be here");
    //         // and some more logging here!
    //     }
    // });

    // it("PUT invalid courses dataset should reject - wrong path", function () {
    //     try {
    //         let file = "./test/data/courses.zip";
    //         return chai.request("http://localhost:4321")
    //             .put("/dataset/courses/courses")
    //             .attach("body", fs.readFileSync(file), "./test/data/rooms.zip")
    //             .then(
    //                 (res) => {
    //                 Log.test(`PUT test for wrong path in courses dataset should be rejected`);
    //                 expect(res.status).to.be.equal(400);
    //                 // Expect length of list of datasets to be three?????
    //                 }
    //             )
    //             .catch(function (err: any) {
    //                 // some logging here please!
    //                 expect(err.status).to.be.equal(400);
    //                 // expect.fail("Put dataset should not fail if the implementation is correct");
    //             });
    //     } catch (err) {
    //         expect.fail("PUT test for courses dataset should be OK");
    //         // and some more logging here!
    //     }
    // });
    // it("PUT invalid courses dataset should reject - wrong URI", function () {
    //     try {
    //         let file = "./test/data/courses.zip";
    //         return chai.request("http://localhost:4321")
    //             .put("/dataset/courses/rooms")
    //             .attach("body", fs.readFileSync(file), "./test/data/courses.zip")
    //             .then(
    //                 (res) => {
    //                 Log.test(`PUT test for wrong URI in courses dataset should be rejected`);
    //                 expect(res.status).to.be.equal(400);
    //                 }
    //             )
    //             .catch(function (err: any) {
    //                 // some logging here please!
    //                 expect(err.status).to.be.equal(400);
    //                 // expect.fail("Put dataset should not fail if the implementation is correct");
    //             });
    //     } catch (err) {
    //         expect.fail("PUT test for courses dataset should be OK");
    //         // and some more logging here!
    //     }
    // });
    // it("PUT invalid courses dataset should reject - Not zip", function () {
    //     try {
    //         let file = "./test/data/notZIP.txt";
    //         return chai.request("http://localhost:4321")
    //             .put("/dataset/notZIP/courses")
    //             .attach("body", fs.readFileSync(file), "./test/data/notZIP.txt")
    //             .then(
    //                 (res) => {
    //                 Log.test(`PUT test for Not zip in courses dataset should be rejected`);
    //                 expect(res.status).to.be.equal(400);
    //                 }
    //             )
    //             .catch(function (err: any) {
    //                 // some logging here please!
    //                 expect(err.status).to.be.equal(400);
    //                 // expect.fail("Put dataset should not fail if the implementation is correct");
    //             });
    //     } catch (err) {
    //         expect.fail("PUT test for courses dataset should be OK");
    //         // and some more logging here!
    //     }
    // });
    // it("PUT invalid courses dataset should reject - Zero section", function () {
    //     try {
    //         let file = "./test/data/zerosectionsdataset.zip";
    //         return chai.request("http://localhost:4321")
    //             .put("/dataset/zerosection/courses")
    //             .attach("body", fs.readFileSync(file), "./test/data/zerosectionsdataset.zip")
    //             .then(
    //                 (res) => {
    //                 Log.test(`PUT test for Zero section in courses dataset should be rejected`);
    //                 expect(res.status).to.be.equal(400);
    //                 }
    //             )
    //             .catch(function (err: any) {
    //                 // some logging here please!
    //                 expect(err.status).to.be.equal(400);
    //                 // expect.fail("Put dataset should not fail if the implementation is correct");
    //             });
    //     } catch (err) {
    //         expect.fail("PUT test for courses dataset should be OK");
    //         // and some more logging here!
    //     }
    // });
    // it("PUT invalid courses dataset should reject - Bad json", function () {
    //     try {
    //         let file = "./test/data/invalidjson2.zip";
    //         return chai.request("http://localhost:4321")
    //             .put("/dataset/invalidjson2/courses")
    //             .attach("body", fs.readFileSync(file), "./test/data/invalidjson2.zip")
    //             .then(
    //                 (res) => {
    //                 Log.test(`PUT test for bad json in courses dataset should be rejected`);
    //                 expect(res.status).to.be.equal(400);
    //                 // Expect length of list of datasets to be three?????
    //                 }
    //             )
    //             .catch(function (err: any) {
    //                 // some logging here please!
    //                 expect(err.status).to.be.equal(400);
    //                 // expect.fail("Put dataset should not fail if the implementation is correct");
    //             });
    //     } catch (err) {
    //         expect.fail("PUT test for courses dataset should be OK");
    //         // and some more logging here!
    //     }
    // });
    it("get test for dataset", async function () {
        try {
            const res = await chai.request("http://localhost:4321")
                .get("/dataset");
            Log.test(`GET test should be OK`);
            expect(res.status).to.be.equal(200);
        } catch (err) {
            Log.info(err);
            // expect.fail("GET test for courses dataset should be OK");
            // and some more logging here!
        }
    });
    it("POST query 200", async function () {
        try {
            let jsonfile ='./test/queries/RoomValidGivenExample15.json';
            var obj = JSON.parse(fs.readFileSync(jsonfile, 'utf8'));
            // Log.info(`=====================`);
            // Log.info(obj["result"]);
            // Log.info(`=====================`);
            return chai.request("http://localhost:4321")
            .post("/query")
            .send(obj["query"])
            .then(
                (res) => {
                Log.test(`POST query test should be OK`);
                expect(res.status).to.be.equal(200);
                expect(res.body["result"]).to.be.deep.equal(obj["result"]);
                }
            )
            .catch(function (err: any) {
                // some logging here please!
                Log.info(err.status);
                expect(err.status).to.be.equal(400);
                // expect.fail("Post 200 should not be here");
            });
        } catch (err) {
            Log.info(err.status);
            expect.fail("Post 200 should not be here");
            // and some more logging here!
        }
    });
    it("POST query 200 when stop the server but has on disk", async function () {
        try {
            let jsonfile ='./test/queries/RoomValidGivenExample15.json';
            var obj = JSON.parse(fs.readFileSync(jsonfile, 'utf8'));
            server.stop().then(() => {
                Log.test(`Has stopped the Server!!`);
            });
            server.start().then((success) => {
                if (success) {
                    Log.test(`Has Started the Server!!`);
                } else {
                    Log.test(`Has not Started the Server!!`);
                }
            });
            return chai.request("http://localhost:4321")
                .post("/query")
                .send(obj["query"])
                .then(
                    (res) => {
                        Log.test(`POST query test should be OK`);
                        expect(res.status).to.be.equal(200);
                        expect(res.body["result"]).to.be.deep.equal(obj["result"]);
                    }
                )
                .catch(function (err: any) {
                    // some logging here please!
                    Log.info(err.status);
                    expect(err.status).to.be.equal(400);
                    // expect.fail("Post 200 should not be here");
                });
        } catch (err) {
            expect.fail("Post 200 should not be here");
            // and some more logging here!
        }
    });
    it("POST query 400", async function () {
        try {
            let jsonfile ='./test/queries/groupEmpty.json';
            var obj = JSON.parse(fs.readFileSync(jsonfile, 'utf8'));
            try {
                const res = await chai.request("http://localhost:4321")
                    .post("/query")
                    .send(obj["query"]);
                Log.test(`POST test should be NOT OK`);
                expect(res.status).to.be.equal(400);
            }
            catch (err) {
                // some logging here please!
                Log.info(err);
                expect(err.status).to.be.equal(400);
            }
        } catch (err) {
            expect.fail("POST test should be NOT OK");
            // and some more logging here!
        }
    });
    it("del test for dataset", async function () {
        try {
            const res = await chai.request("http://localhost:4321")
                .del("/dataset/courses/courses")
                .then(
                    (res) => {
                        Log.test(`DEL test for courses should be OK`);
                        expect(res.status).to.be.equal(200);
                        expect(res.body["result"]).to.be.equal("courses");
                    }
                ).catch(function (err: any) {
                expect. fail("Put dataset should not fail if the implementation is correct");
            });
        } catch (err) {
            expect.fail("DEL test for courses dataset should be OK");
            // and some more logging here!
        }
    });
    it("POST query 400", async function () {
        try {
            let query = {
                WHERE: {
                    OR: [
                        {
                            GT: {
                                courses_avg: 75
                            }
                        },
                        {
                            IS: {
                                courses_dept: "adhe"
                            }
                        }
                    ]
                },
                OPTIONS: {
                    COLUMNS: [
                        "courses_uuid",
                    ]
                }
            };
            try {
                const res = await chai.request("http://localhost:4321")
                    .post("/query")
                    .send(query);
                Log.test(`POST test should be NOT OK`);
                expect(res.status).to.be.equal(400);
            }
            catch (err) {
                // some logging here please!
                Log.info(err);
                expect(err.status).to.be.equal(400);
            }
        } catch (err) {
            expect.fail("POST test should be NOT OK");
            // and some more logging here!
        }
    });
    it("del test for dataset - deletetwice", async function () {
        try {
            return chai.request("http://localhost:4321")
            .del("/dataset/courses/courses")
            .then(
                (res) => {
                Log.test(`DEL test for courses twice should not be OK`);
                expect(res.status).to.be.equal(404);
                }
            ).catch( (err) => {
                // some logging here please!
                expect(err.status).to.be.equal(404);
            });
        } catch (err) {
            Log.info(err.status);
            // expect(err).to.be.instanceOf(NotFoundError);
            // and some more logging here!
        }
    });
    it("del test for dataset - delete not added", async function () {
        try {
            try {
                const res = await chai.request("http://localhost:4321")
                    .del("/dataset/notadded/courses");
                Log.test(`DEL test for not added set should be rejected`);
                expect(res.status).to.be.equal(404);
            }
            catch (err) {
                // some logging here please!
                expect(err.status).to.be.equal(404);
            }
        } catch (err) {
            expect.fail("DEL test for courses dataset should be OK");
            // and some more logging here!
        }
    });
    // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
