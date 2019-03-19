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
const fs = require("fs");
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
                return chai.request("http://localhost:4321")
                    .put("/dataset/courses/courses")
                    .attach("body", fs.readFileSync(file), "courses.zip")
                    .then((res) => {
                    Util_1.default.test(`PUT test for courses dataset OK`);
                    chai_1.expect(res.status).to.be.equal(200);
                })
                    .catch(function (err) {
                    Util_1.default.info(err);
                    chai_1.expect.fail("Put dataset should not fail if the implementation is correct");
                });
            }
            catch (err) {
                chai_1.expect.fail("PUT test for courses dataset should be OK");
            }
        });
    });
    it("PUT duplicate courses dataset should reject", function () {
        try {
            let file = "./test/data/courses.zip";
            let content;
            TestUtil_1.default.readFileAsync(file).then((buf) => {
                content = buf.toString("base64");
            })
                .then(() => {
                facade.addDataset("courses", content, IInsightFacade_1.InsightDatasetKind.Courses);
            })
                .then(() => {
                return chai.request("http://localhost:4321")
                    .put("/dataset/courses/courses")
                    .attach("body", fs.readFileSync(file), "courses.zip")
                    .then((res) => {
                    Util_1.default.info(res.body);
                    chai_1.expect(res.status).to.be.equal(400);
                })
                    .catch(function (err) {
                    Util_1.default.info(err);
                    chai_1.expect(err.status).to.be.equal(400);
                });
            });
        }
        catch (err) {
            Util_1.default.test(`PUT test for duplicate courses dataset should be rejected`);
            chai_1.expect.fail("should not be here");
        }
    });
    it("PUT invalid courses dataset should reject - wrong content", function () {
        try {
            let file = "./test/data/rooms.zip";
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .attach("body", fs.readFileSync(file), "./test/data/courses.zip")
                .then((res) => {
                Util_1.default.test(`PUT test for wrong content in courses dataset should be rejected`);
            })
                .catch(function (res) {
                chai_1.expect(res.status).to.be.equal(400);
            });
        }
        catch (err) {
            chai_1.expect.fail("should not be here");
        }
    });
    it("PUT invalid courses dataset should reject - wrong path", function () {
        try {
            let file = "./test/data/courses.zip";
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .attach("body", fs.readFileSync(file), "./test/data/rooms.zip")
                .then((res) => {
                Util_1.default.test(`PUT test for wrong path in courses dataset should be rejected`);
            })
                .catch(function (err) {
                chai_1.expect(err.status).to.be.equal(400);
            });
        }
        catch (err) {
            chai_1.expect.fail("PUT test for courses dataset should be OK");
        }
    });
    it("PUT invalid courses dataset should reject - wrong URI", function () {
        try {
            let file = "./test/data/courses.zip";
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/rooms")
                .attach("body", fs.readFileSync(file), "./test/data/courses.zip")
                .then((res) => {
                Util_1.default.test(`PUT test for wrong URI in courses dataset should be rejected`);
            })
                .catch(function (err) {
                chai_1.expect(err.status).to.be.equal(400);
            });
        }
        catch (err) {
            chai_1.expect.fail("PUT test for courses dataset should be OK");
        }
    });
    it("PUT invalid courses dataset should reject - Not zip", function () {
        try {
            let file = "./test/data/notZIP.txt";
            return chai.request("http://localhost:4321")
                .put("/dataset/notZIP/courses")
                .attach("body", fs.readFileSync(file), "./test/data/notZIP.txt")
                .then((res) => {
                Util_1.default.test(`PUT test for Not zip in courses dataset should be rejected`);
            })
                .catch(function (err) {
                chai_1.expect(err.status).to.be.equal(400);
            });
        }
        catch (err) {
            chai_1.expect.fail("PUT test for courses dataset should be OK");
        }
    });
    it("PUT invalid courses dataset should reject - Zero section", function () {
        try {
            let file = "./test/data/zerosectionsdataset.zip";
            return chai.request("http://localhost:4321")
                .put("/dataset/zerosection/courses")
                .attach("body", fs.readFileSync(file), "./test/data/zerosectionsdataset.zip")
                .then((res) => {
                Util_1.default.test(`PUT test for Zero section in courses dataset should be rejected`);
            })
                .catch(function (err) {
                chai_1.expect(err.status).to.be.equal(400);
            });
        }
        catch (err) {
            chai_1.expect.fail("PUT test for courses dataset should be OK");
        }
    });
    it("PUT invalid courses dataset should reject - Bad json", function () {
        try {
            let file = "./test/data/invalidjson2.zip";
            return chai.request("http://localhost:4321")
                .put("/dataset/invalidjson2/courses")
                .attach("body", fs.readFileSync(file), "./test/data/invalidjson2.zip")
                .then((res) => {
                Util_1.default.test(`PUT test for bad json in courses dataset should be rejected`);
            })
                .catch(function (err) {
                chai_1.expect(err.status).to.be.equal(400);
            });
        }
        catch (err) {
            chai_1.expect.fail("PUT test for courses dataset should be OK");
        }
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
                    .then(() => {
                    return chai.request("http://localhost:4321")
                        .del("/dataset/courses/courses")
                        .then((res) => {
                        Util_1.default.test(`DEL test for courses should be OK`);
                        chai_1.expect(res.status).to.be.equal(200);
                    });
                })
                    .catch(function (err) {
                    chai_1.expect.fail("Put dataset should not fail if the implementation is correct");
                });
            }
            catch (err) {
                chai_1.expect.fail("DEL test for courses dataset should be OK");
            }
        });
    });
    it("del test for dataset - deletetwice", function () {
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
                    .then(() => {
                    facade.removeDataset("courses");
                })
                    .then(() => {
                    return chai.request("http://localhost:4321")
                        .del("/dataset/courses/courses")
                        .then((res) => {
                        Util_1.default.test(`DEL test for courses should be OK`);
                        chai_1.expect(res.status).to.be.equal(404);
                    });
                })
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
        try {
            return chai.request("http://localhost:4321")
                .del("/dataset/notadded/courses")
                .then((res) => {
                Util_1.default.test(`DEL test for not added set should be rejected`);
            })
                .catch(function (err) {
                chai_1.expect(err.status).to.be.equal(404);
            });
        }
        catch (err) {
            chai_1.expect.fail("DEL test for courses dataset should be OK");
        }
    });
    it("get test for dataset", function () {
        try {
            let file = "./test/data/courses.zip";
            let content;
            TestUtil_1.default.readFileAsync(file).then((buf) => {
                content = buf.toString("base64");
            })
                .then(() => {
                facade.addDataset("courses", content, IInsightFacade_1.InsightDatasetKind.Courses);
            })
                .then(() => {
                return chai.request("http://localhost:4321")
                    .get("/dataset")
                    .then((res) => {
                    Util_1.default.test(`GET test should be OK`);
                    chai_1.expect(res.status).to.be.equal(200);
                })
                    .catch(function (err) {
                    chai_1.expect.fail("GET dataset should not fail if the implementation is correct");
                });
            })
                .catch(function (err) {
                chai_1.expect.fail("Get dataset should not fail if the implementation is correct");
            });
        }
        catch (err) {
            chai_1.expect.fail("GET test for courses dataset should be OK");
        }
    });
    it("POST query 200", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let file = "./test/data/courses.zip";
                let content;
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
                chai.request("http://localhost:4321")
                    .put("/dataset/courses/courses")
                    .attach("body", fs.readFileSync(file), "courses.zip");
                return chai.request("http://localhost:4321")
                    .post("/query")
                    .send(query)
                    .then((res) => {
                    Util_1.default.test(`POST query test should be OK`);
                    chai_1.expect(res.status).to.be.equal(200);
                })
                    .catch(function (err) {
                    chai_1.expect.fail("Post query should not fail if the implementation is correct");
                });
            }
            catch (err) {
                chai_1.expect.fail("GET test for courses dataset should be OK");
            }
        });
    });
    it("POST query 400", function () {
        try {
            let file = "./test/data/courses.zip";
            let content;
            TestUtil_1.default.readFileAsync(file).then((buf) => {
                content = buf.toString("base64");
            })
                .then(() => {
                facade.addDataset("courses", content, IInsightFacade_1.InsightDatasetKind.Courses);
            });
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
            chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .attach("body", fs.readFileSync(file), "courses.zip");
            return chai.request("http://localhost:4321")
                .post("/query")
                .send(query)
                .then((res) => {
                Util_1.default.test(`POST test should be NOT OK`);
            })
                .catch(function (err) {
                chai_1.expect(err.status).to.be.equal(400);
            });
        }
        catch (err) {
            chai_1.expect.fail("POST test should be NOT OK");
        }
    });
});
//# sourceMappingURL=Server.spec.js.map