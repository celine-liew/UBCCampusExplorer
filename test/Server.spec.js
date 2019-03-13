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
            return server.start();
        }
        catch (err) {
            chai_1.expect.fail("fail to start the server");
        }
    });
    after(function () {
        return server.stop();
    });
    beforeEach(function () {
        Util_1.default.test(`BeforeTest: ${this.currentTest.title}`);
    });
    afterEach(function () {
        Util_1.default.test(`AfterTest: ${this.currentTest.title}`);
    });
    const datasetsToLoad = {
        courses: "./test/data/courses.zip",
        rooms: "./test/data/rooms.zip"
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
            facade.addDataset("courses", datasets["courses"], IInsightFacade_1.InsightDatasetKind.Courses);
            facade.addDataset("rooms", datasets["rooms"], IInsightFacade_1.InsightDatasetKind.Rooms);
        });
    });
    it("PUT test for courses dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/smalldataset/courses")
                .attach("body", datasets["smalldataset"], "./test/data/smalldataset.zip")
                .then()
                .catch(function (err) {
                chai_1.expect.fail();
            });
        }
        catch (err) {
        }
    });
});
//# sourceMappingURL=Server.spec.js.map