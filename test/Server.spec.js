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
            Util_1.default.test(`Start the Server!!`);
            return server.start();
        }
        catch (err) {
            chai_1.expect.fail("fail to start the server");
        }
    });
    after(function () {
        server.stop();
    });
    beforeEach(function () {
        Util_1.default.test(`BeforeTest: ${this.currentTest.title}`);
    });
    afterEach(function () {
        Util_1.default.test(`AfterTest: ${this.currentTest.title}`);
    });
    const datasetsToLoad = {
        courses: "./test/data/courses.zip",
        rooms: "./test/data/rooms.zip",
        smalldataset: "./test/data/smalldataset.zip",
        notZIP: "./test/data/notZIP.txt",
        zerosection: "./test/data/zerosectionsdataset.zip",
        invalidjson2: "./test/data/invalidjson2.zip",
        cpsccourses2: "./test/data/cpsccourses2.zip"
    };
    let datasets;
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            const loadDatasetPromises = [];
            for (const [id, path] of Object.entries(datasetsToLoad)) {
                loadDatasetPromises.push(TestUtil_1.default.readFileAsync(path));
            }
            const loadedDatasets = (yield Promise.all(loadDatasetPromises)).map((buf, i) => {
                return { [Object.keys(datasetsToLoad)[i]]: buf.toString("base64") };
            });
            datasets = Object.assign({}, ...loadedDatasets);
            yield facade.addDataset("courses", datasets["courses"], IInsightFacade_1.InsightDatasetKind.Courses);
            yield facade.addDataset("rooms", datasets["rooms"], IInsightFacade_1.InsightDatasetKind.Rooms);
        });
    });
    it("PUT test for courses dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/smalldataset/courses")
                .attach("body", datasets["smalldataset"], "./test/data/smalldataset.zip")
                .then((res) => {
                Util_1.default.test(`PUT test for courses dataset OK`);
                chai_1.expect(res.status).to.be.equal(200);
            })
                .catch(function (err) {
                chai_1.expect.fail("Put dataset should not fail if the implementation is correct");
            });
        }
        catch (err) {
            chai_1.expect.fail("PUT test for courses dataset should be OK");
        }
    });
    it("PUT duplicate courses dataset should reject", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .attach("body", datasets["courses"], "./test/data/courses.zip")
                .then((res) => {
                Util_1.default.test(`PUT test for duplicate courses dataset should be rejected`);
                chai_1.expect(res.status).to.be.equal(400);
            })
                .catch(function (err) {
                chai_1.expect.fail("Put dataset should not fail if the implementation is correct");
            });
        }
        catch (err) {
            Util_1.default.test(`PUT test for duplicate courses dataset should be rejected`);
        }
    });
    it("PUT invalid courses dataset should reject - wrong content", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .attach("body", datasets["rooms"], "./test/data/courses.zip")
                .then((res) => {
                Util_1.default.test(`PUT test for wrong content in courses dataset should be rejected`);
                chai_1.expect(res.status).to.be.equal(400);
            })
                .catch(function (err) {
                chai_1.expect.fail("Put dataset should not fail if the implementation is correct");
            });
        }
        catch (err) {
            chai_1.expect.fail("PUT test for courses dataset should be OK");
        }
    });
    it("PUT invalid courses dataset should reject - wrong path", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .attach("body", datasets["courses"], "./test/data/rooms.zip")
                .then((res) => {
                Util_1.default.test(`PUT test for wrong path in courses dataset should be rejected`);
                chai_1.expect(res.status).to.be.equal(400);
            })
                .catch(function (err) {
                chai_1.expect.fail("Put dataset should not fail if the implementation is correct");
            });
        }
        catch (err) {
            chai_1.expect.fail("PUT test for courses dataset should be OK");
        }
    });
    it("PUT invalid courses dataset should reject - wrong URI", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/rooms")
                .attach("body", datasets["courses"], "./test/data/courses.zip")
                .then((res) => {
                Util_1.default.test(`PUT test for wrong URI in courses dataset should be rejected`);
                chai_1.expect(res.status).to.be.equal(400);
            })
                .catch(function (err) {
                chai_1.expect.fail("Put dataset should not fail if the implementation is correct");
            });
        }
        catch (err) {
            chai_1.expect.fail("PUT test for courses dataset should be OK");
        }
    });
    it("PUT invalid courses dataset should reject - Not zip", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/notZIP/courses")
                .attach("body", datasets["notZIP"], "./test/data/notZIP.txt")
                .then((res) => {
                Util_1.default.test(`PUT test for Not zip in courses dataset should be rejected`);
                chai_1.expect(res.status).to.be.equal(400);
            })
                .catch(function (err) {
                chai_1.expect.fail("Put dataset should not fail if the implementation is correct");
            });
        }
        catch (err) {
            chai_1.expect.fail("PUT test for courses dataset should be OK");
        }
    });
    it("PUT invalid courses dataset should reject - Zero section", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/zerosection/courses")
                .attach("body", datasets["zerosection"], "./test/data/zerosectionsdataset.zip")
                .then((res) => {
                Util_1.default.test(`PUT test for Zero section in courses dataset should be rejected`);
                chai_1.expect(res.status).to.be.equal(400);
            })
                .catch(function (err) {
                chai_1.expect.fail("Put dataset should not fail if the implementation is correct");
            });
        }
        catch (err) {
            chai_1.expect.fail("PUT test for courses dataset should be OK");
        }
    });
    it("PUT invalid courses dataset should reject - Bad json", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/invalidjson2/courses")
                .attach("body", datasets["invalidjson2"], "./test/data/invalidjson2.zip")
                .then((res) => {
                Util_1.default.test(`PUT test for bad json in courses dataset should be rejected`);
                chai_1.expect(res.status).to.be.equal(400);
            })
                .catch(function (err) {
                chai_1.expect.fail("Put dataset should not fail if the implementation is correct");
            });
        }
        catch (err) {
            chai_1.expect.fail("PUT test for courses dataset should be OK");
        }
    });
    it("del test for dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .del("/dataset/cpsccourses2/courses")
                .then((res) => {
                Util_1.default.test(`DEL test for cpsccourses2 should be OK`);
                chai_1.expect(res.status).to.be.equal(200);
            })
                .catch(function (err) {
                chai_1.expect.fail("DEL dataset should not fail if the implementation is correct");
            });
        }
        catch (err) {
            chai_1.expect.fail("DEL test for courses dataset should be OK");
        }
    });
    it("del test for dataset - deletetwice", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield facade.removeDataset("cpsccourses2");
                return chai.request("http://localhost:4321")
                    .del("/dataset/cpsccourses2/courses")
                    .then((res) => {
                    Util_1.default.test(`DEL test for cpsccourses2 twice should be rejected`);
                    chai_1.expect(res.status).to.be.equal(400);
                })
                    .catch(function (err) {
                    chai_1.expect.fail("DEL dataset should not fail if the implementation is correct");
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
                chai_1.expect(res.status).to.be.equal(400);
            })
                .catch(function (err) {
                chai_1.expect.fail("DEL dataset should not fail if the implementation is correct");
            });
        }
        catch (err) {
            chai_1.expect.fail("DEL test for courses dataset should be OK");
        }
    });
    it("get test for dataset - ", function () {
        try {
            return chai.request("http://localhost:4321")
                .get("/dataset")
                .then((res) => {
                Util_1.default.test(`GET test should be OK`);
                chai_1.expect(res.status).to.be.equal(200);
            })
                .catch(function (err) {
                chai_1.expect.fail("GET dataset should not fail if the implementation is correct");
            });
        }
        catch (err) {
            chai_1.expect.fail("GET test for courses dataset should be OK");
        }
    });
});
//# sourceMappingURL=Server.spec.js.map