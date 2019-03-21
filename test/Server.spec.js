"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = require("../src/rest/Server");
const TestUtil_1 = require("./TestUtil");
const Util_1 = require("../src/Util");
const InsightFacade_1 = require("../src/controller/InsightFacade");
const chai = require("chai");
const chai_1 = require("chai");
const chaiHttp = require("chai-http");
const IInsightFacade_1 = require("../src/controller/IInsightFacade");
describe("Facade D3", function () {
    let facade = null;
    let server = null;
    chai.use(chaiHttp);
    before(function () {
        facade = new InsightFacade_1.default();
        server = new Server_1.default(4321);
        try {
            server.start().then((success) => {
                if (success) {
                    Util_1.default.test(`Has Started the Server!!`);
                }
                else {
                    Util_1.default.test(`Has not Started the Server!!`);
                }
            });
        }
        catch (err) {
            Util_1.default.error(err);
            chai_1.expect.fail("fail to start the server");
        }
    });
    after(function () {
        server.stop().then(() => {
            Util_1.default.test(`Has stopped the Server!!`);
        });
    });
    beforeEach(function () {
        Util_1.default.test(`BeforeTest: ${this.currentTest.title}`);
    });
    afterEach(function () {
        Util_1.default.test(`AfterTest: ${this.currentTest.title}`);
    });
    it("PUT test for courses dataset", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let file = "./test/data/courses.zip";
                Util_1.default.info(file);
                let buffer = yield TestUtil_1.default.readFileAsync(file);
                Util_1.default.info(`=====================`);
                console.log(Buffer.isBuffer(buffer));
                Util_1.default.info(`=====================`);
                return chai.request("http://localhost:4321")
                    .put("/dataset/courses/courses")
                    .attach("body", buffer, "courses.zip")
                    .then((res) => {
                    Util_1.default.test(`PUT test for courses dataset OK`);
                    chai_1.expect(res.status).to.be.equal(200);
                })
                    .catch(function (err) {
                    Util_1.default.info(err.status);
                    Util_1.default.info(err.body);
                    Util_1.default.info(err);
                    chai_1.expect.fail("Put dataset should not fail if the implementation is correct");
                });
            }
            catch (err) {
                chai_1.expect.fail("PUT test for courses dataset should be OK");
            }
        });
    });
    it("PUT test for room dataset", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let file = "./test/data/rooms.zip";
                Util_1.default.info(file);
                let buffer = yield TestUtil_1.default.readFileAsync(file);
                return chai.request("http://localhost:4321")
                    .put("/dataset/rooms/rooms")
                    .attach("body", buffer, "rooms.zip")
                    .then((res) => {
                    Util_1.default.test(`PUT test for rooms dataset OK`);
                    chai_1.expect(res.status).to.be.equal(200);
                })
                    .catch(function (err) {
                    Util_1.default.info(err);
                    chai_1.expect.fail("Put dataset should not fail if the implementation is correct");
                });
            }
            catch (err) {
                chai_1.expect.fail("PUT test for rooms dataset should be OK");
            }
        });
    });
    it("get test for dataset", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield chai.request("http://localhost:4321")
                    .get("/dataset");
                Util_1.default.test(`GET test should be OK`);
                chai_1.expect(res.status).to.be.equal(200);
            }
            catch (err) {
                Util_1.default.info(err);
            }
        });
    });
    it("POST query 200", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let query = {
                    WHERE: {
                        OR: [
                            {
                                GT: {
                                    courses_avg: 85
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
                return chai.request("http://localhost:4321")
                    .post("/query")
                    .send(query)
                    .then((res) => {
                    Util_1.default.test(`POST query test should be OK`);
                    chai_1.expect(res.status).to.be.equal(200);
                })
                    .catch(function (err) {
                    chai_1.expect(err.status).to.be.equal(400);
                });
            }
            catch (err) {
                chai_1.expect.fail("GET test for courses dataset should be OK");
            }
        });
    });
    it("POST query 400", function () {
        return __awaiter(this, void 0, void 0, function* () {
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
                            "courses_uu3id",
                        ]
                    }
                };
                try {
                    const res = yield chai.request("http://localhost:4321")
                        .post("/query")
                        .send(query);
                    Util_1.default.test(`POST test should be NOT OK`);
                    chai_1.expect(res.status).to.be.equal(400);
                }
                catch (err) {
                    Util_1.default.info(err);
                    chai_1.expect(err.status).to.be.equal(400);
                }
            }
            catch (err) {
                chai_1.expect.fail("POST test should be NOT OK");
            }
        });
    });
    it("del test for dataset", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let file = "./test/data/courses.zip";
                let content;
                TestUtil_1.default.readFileAsync(file).then((buf) => {
                    content = buf.toString("base64");
                })
                    .then(() => {
                    facade.addDataset("courses", content, IInsightFacade_1.InsightDatasetKind.Courses);
                })
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    const res = yield chai.request("http://localhost:4321")
                        .del("/dataset/courses/courses");
                    Util_1.default.test(`DEL test for courses should be OK`);
                    chai_1.expect(res.status).to.be.equal(200);
                }))
                    .catch(function (err) {
                    chai_1.expect.fail("Put dataset should not fail if the implementation is correct");
                });
            }
            catch (err) {
                chai_1.expect.fail("DEL test for courses dataset should be OK");
            }
        });
    });
    it("del test for dataset - delete not added", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                try {
                    const res = yield chai.request("http://localhost:4321")
                        .del("/dataset/notadded/courses");
                    Util_1.default.test(`DEL test for not added set should be rejected`);
                    chai_1.expect(res.status).to.be.equal(404);
                }
                catch (err) {
                    chai_1.expect(err.status).to.be.equal(404);
                }
            }
            catch (err) {
                chai_1.expect.fail("DEL test for courses dataset should be OK");
            }
        });
    });
});
//# sourceMappingURL=Server.spec.js.map