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
                let buffer = yield TestUtil_1.default.readFileAsync(file);
                return chai.request("http://localhost:4321")
                    .put("/dataset/courses/courses")
                    .attach("body", buffer, "courses.zip")
                    .then((res) => {
                    Util_1.default.test(`PUT test for courses dataset OK`);
                    chai_1.expect(res.status).to.be.equal(200);
                    chai_1.expect(res.body["result"]).to.deep.include("courses");
                })
                    .catch(function (err) {
                    Util_1.default.info(err.status);
                    Util_1.default.info(err.body);
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
                    chai_1.expect(res.body["result"]).to.deep.include("rooms");
                })
                    .catch(function (err) {
                    chai_1.expect.fail("Put dataset should not fail if the implementation is correct");
                });
            }
            catch (err) {
                chai_1.expect.fail("PUT test for rooms dataset should be OK");
            }
        });
    });
    it("PUT test for courses dataset", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let file = "./test/data/courses.zip";
                let buffer = yield TestUtil_1.default.readFileAsync(file);
                return chai.request("http://localhost:4321")
                    .put("/dataset/courses/courses")
                    .attach("body", buffer, "courses.zip")
                    .then((res) => {
                    Util_1.default.test(`PUT test for courses dataset OK`);
                    chai_1.expect.fail("Put dataset should not be here");
                })
                    .catch(function (err) {
                    Util_1.default.info(err.status);
                    Util_1.default.info(err.body);
                    chai_1.expect(err.status).to.be.equal(400);
                });
            }
            catch (err) {
                chai_1.expect.fail("PUT test for courses dataset should be OK");
            }
        });
    });
    it("PUT invalid courses dataset should reject - wrong content", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let file = "./test/data/rooms.zip";
                let buffer = yield TestUtil_1.default.readFileAsync(file);
                return chai.request("http://localhost:4321")
                    .put("/dataset/courses/courses")
                    .attach("body", buffer, "./test/data/courses.zip")
                    .then((res) => {
                    Util_1.default.test(`PUT test for wrong content in courses dataset should be rejected`);
                    chai_1.expect.fail("should not be here");
                })
                    .catch(function (err) {
                    chai_1.expect(err.status).to.be.equal(400);
                });
            }
            catch (err) {
                chai_1.expect.fail("should not be here");
            }
        });
    });
    it("PUT invalid courses dataset should reject - wrong path", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let file = "./test/data/courses.zip";
                let buffer = yield TestUtil_1.default.readFileAsync(file);
                return chai.request("http://localhost:4321")
                    .put("/dataset/courses/courses")
                    .attach("body", buffer, "./test/data/rooms.zip")
                    .then((res) => {
                    Util_1.default.test(`PUT test for wrong path in courses dataset should be rejected`);
                    chai_1.expect.fail("should not be here");
                })
                    .catch(function (err) {
                    chai_1.expect(err.status).to.be.equal(400);
                });
            }
            catch (err) {
                chai_1.expect.fail("PUT test for courses dataset should be OK");
            }
        });
    });
    it("PUT invalid courses dataset should reject - wrong URI", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let file = "./test/data/courses.zip";
                let buffer = yield TestUtil_1.default.readFileAsync(file);
                return chai.request("http://localhost:4321")
                    .put("/dataset/courses/rooms")
                    .attach("body", buffer, "./test/data/courses.zip")
                    .then((res) => {
                    Util_1.default.test(`PUT test for wrong URI in courses dataset should be rejected`);
                    chai_1.expect.fail("should not be here");
                })
                    .catch(function (err) {
                    chai_1.expect(err.status).to.be.equal(400);
                });
            }
            catch (err) {
                chai_1.expect.fail("PUT test for courses dataset should be OK");
            }
        });
    });
    it("PUT invalid courses dataset should reject - Not zip", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let file = "./test/data/notZIP.txt";
                let buffer = yield TestUtil_1.default.readFileAsync(file);
                return chai.request("http://localhost:4321")
                    .put("/dataset/notZIP/courses")
                    .attach("body", buffer, "./test/data/notZIP.txt")
                    .then((res) => {
                    Util_1.default.test(`PUT test for Not zip in courses dataset should be rejected`);
                    chai_1.expect.fail("should not be here");
                })
                    .catch(function (err) {
                    chai_1.expect(err.status).to.be.equal(400);
                });
            }
            catch (err) {
                chai_1.expect.fail("PUT test for courses dataset should be OK");
            }
        });
    });
    it("PUT invalid courses dataset should reject - Zero section", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let file = "./test/data/zerosectionsdataset.zip";
                let buffer = yield TestUtil_1.default.readFileAsync(file);
                return chai.request("http://localhost:4321")
                    .put("/dataset/zerosection/courses")
                    .attach("body", buffer, "./test/data/zerosectionsdataset.zip")
                    .then((res) => {
                    Util_1.default.test(`PUT test for Zero section in courses dataset should be rejected`);
                    chai_1.expect.fail("should not be here");
                })
                    .catch(function (err) {
                    chai_1.expect(err.status).to.be.equal(400);
                });
            }
            catch (err) {
                chai_1.expect.fail("PUT test for courses dataset should be OK");
            }
        });
    });
    it("PUT invalid courses dataset should reject - Bad json", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let file = "./test/data/invalidjson2.zip";
                let buffer = yield TestUtil_1.default.readFileAsync(file);
                return chai.request("http://localhost:4321")
                    .put("/dataset/invalidjson2/courses")
                    .attach("body", buffer, "./test/data/invalidjson2.zip")
                    .then((res) => {
                    Util_1.default.test(`PUT test for bad json in courses dataset should be rejected`);
                    chai_1.expect.fail("should not be here");
                })
                    .catch(function (err) {
                    chai_1.expect(err.status).to.be.equal(400);
                });
            }
            catch (err) {
                chai_1.expect.fail("PUT test for courses dataset should be OK");
            }
        });
    });
    it("get test for dataset", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield chai.request("http://localhost:4321")
                    .get("/datasets");
                Util_1.default.test(`GET test should be OK`);
                chai_1.expect(res.status).to.be.equal(200);
            }
            catch (err) {
                Util_1.default.info(err);
                chai_1.expect.fail("GET test for courses dataset should be OK");
            }
        });
    });
    it("get test for dataset but a wrong url", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield chai.request("http://localhost:4321")
                    .get("/dataset");
                Util_1.default.test(`GET test should be OK`);
                chai_1.expect.fail("GET test for courses dataset should be OK");
            }
            catch (err) {
                Util_1.default.info(err);
                chai_1.expect(err.status).to.be.equal(500);
            }
        });
    });
    it("POST query 200", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let jsonfile = './test/queries/RoomValidGivenExample15.json';
                var obj = JSON.parse(fs.readFileSync(jsonfile, 'utf8'));
                return chai.request("http://localhost:4321")
                    .post("/query")
                    .send(obj["query"])
                    .then((res) => {
                    Util_1.default.test(`POST query test should be OK`);
                    chai_1.expect(res.status).to.be.equal(200);
                    chai_1.expect(res.body["result"]).to.be.deep.equal(obj["result"]);
                })
                    .catch(function (err) {
                    Util_1.default.info(err.status);
                    chai_1.expect.fail("Post 200 should not be here");
                });
            }
            catch (err) {
                Util_1.default.info(err.status);
                chai_1.expect.fail("Post 200 should not be here");
            }
        });
    });
    it("POST query 200 when stop the server but has on disk", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let jsonfile = './test/queries/RoomValidGivenExample15.json';
                var obj = JSON.parse(fs.readFileSync(jsonfile, 'utf8'));
                server.stop().then(() => {
                    Util_1.default.test(`Has stopped the Server!!`);
                });
                server.start().then((success) => {
                    if (success) {
                        Util_1.default.test(`Has Started the Server!!`);
                    }
                    else {
                        Util_1.default.test(`Has not Started the Server!!`);
                    }
                });
                return chai.request("http://localhost:4321")
                    .post("/query")
                    .send(obj["query"])
                    .then((res) => {
                    Util_1.default.test(`POST query test should be OK`);
                    chai_1.expect(res.status).to.be.equal(200);
                    chai_1.expect(res.body["result"]).to.be.deep.equal(obj["result"]);
                })
                    .catch(function (err) {
                    Util_1.default.info(err.status);
                    chai_1.expect.fail("Post 200 should not be here");
                });
            }
            catch (err) {
                chai_1.expect.fail("Post 200 should not be here");
            }
        });
    });
    it("POST query 400", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let jsonfile = './test/queries/groupEmpty.json';
                var obj = JSON.parse(fs.readFileSync(jsonfile, 'utf8'));
                try {
                    const res = yield chai.request("http://localhost:4321")
                        .post("/query")
                        .send(obj["query"]);
                    Util_1.default.test(`POST test should be NOT OK`);
                    chai_1.expect.fail("Post 400 should not be here");
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
                const res = yield chai.request("http://localhost:4321")
                    .del("/dataset/courses")
                    .then((res) => {
                    Util_1.default.test(`DEL test for courses should be OK`);
                    chai_1.expect(res.status).to.be.equal(200);
                    chai_1.expect(res.body["result"]).to.be.equal("courses");
                }).catch(function (err) {
                    chai_1.expect.fail("Put dataset should not fail if the implementation is correct");
                });
            }
            catch (err) {
                chai_1.expect.fail("DEL test for courses dataset should be OK");
            }
        });
    });
    it("POST query 400 after delete the database", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let jsonfile = './test/queries/and_one_repeat.2.json';
                var obj = JSON.parse(fs.readFileSync(jsonfile, 'utf8'));
                try {
                    const res = yield chai.request("http://localhost:4321")
                        .post("/query")
                        .send(obj["query"]);
                    Util_1.default.test(`POST test should be NOT OK`);
                    chai_1.expect.fail("Put dataset should not run here");
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
    it("del test for dataset - deletetwice", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return chai.request("http://localhost:4321")
                    .del("/dataset/courses")
                    .then((res) => {
                    Util_1.default.test(`DEL test for courses twice should not be OK`);
                    chai_1.expect.fail("del should not be here");
                }).catch((err) => {
                    chai_1.expect(err.status).to.be.equal(404);
                });
            }
            catch (err) {
                Util_1.default.info(err.status);
            }
        });
    });
    it("del test for dataset - delete not added", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                try {
                    const res = yield chai.request("http://localhost:4321")
                        .del("/dataset/notadded");
                    Util_1.default.test(`DEL test for not added set should be rejected`);
                    chai_1.expect.fail("del should not be here");
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