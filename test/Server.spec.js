"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = require("../src/rest/Server");
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
//# sourceMappingURL=Server.spec.js.map