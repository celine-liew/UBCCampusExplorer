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
const chai_1 = require("chai");
const fs = require("fs-extra");
const IInsightFacade_1 = require("../src/controller/IInsightFacade");
const InsightFacade_1 = require("../src/controller/InsightFacade");
const Util_1 = require("../src/Util");
const TestUtil_1 = require("./TestUtil");
describe("InsightFacade Add/Remove Dataset", function () {
    const datasetsToLoad = {
        courses: "./test/data/courses.zip",
        cpsccourses2: "./test/data/cpsccourses2.zip",
        nocourses: "./test/data/nocourses.zip",
        noncoursedatabase: "./test/data/wrongfile.png",
        invalidjson2: "./test/data/invalidjson2.zip",
        onecoursewithsection2: "./test/data/onecoursewithsection2.zip",
        zerosection: "./test/data/zerosectionsdataset.zip",
        notZIP: "./test/data/notZIP.txt",
        wrongfile: "./test/data/wrongfile.png",
        only1validcourse: "./test/data/only1validcourse.zip",
        smalldataset: "./test/data/smalldataset.zip"
    };
    let insightFacade;
    let datasets;
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            Util_1.default.test(`Before: ${this.test.parent.title}`);
            try {
                const loadDatasetPromises = [];
                for (const [id, path] of Object.entries(datasetsToLoad)) {
                    loadDatasetPromises.push(TestUtil_1.default.readFileAsync(path));
                }
                const loadedDatasets = (yield Promise.all(loadDatasetPromises)).map((buf, i) => {
                    return { [Object.keys(datasetsToLoad)[i]]: buf.toString("base64") };
                });
                datasets = Object.assign({}, ...loadedDatasets);
                chai_1.expect(Object.keys(datasets)).to.have.length.greaterThan(0);
            }
            catch (err) {
                chai_1.expect.fail("", "", `Failed to read one or more datasets. ${JSON.stringify(err)}`);
            }
        });
    });
    beforeEach(function () {
        Util_1.default.test(`BeforeTest: ${this.currentTest.title}`);
        try {
            fs.removeSync("./data");
            insightFacade = new InsightFacade_1.default();
        }
        catch (err) {
            Util_1.default.error(err);
        }
        finally {
            chai_1.expect(insightFacade).to.be.instanceOf(InsightFacade_1.default);
        }
    });
    after(function () {
        Util_1.default.test(`After: ${this.test.parent.title}`);
    });
    afterEach(function () {
        Util_1.default.test(`AfterTest: ${this.currentTest.title}`);
    });
    it("Should add a valid dataset", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const id = "smalldataset";
            let response;
            try {
                response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
            }
            catch (err) {
                response = err;
            }
            finally {
                chai_1.expect(response).to.deep.equal([id]);
            }
        });
    });
    it("Should not add a invalid dataset with wrong InsightDatasetKind identifier", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const id = "cpsccourses2";
            let response;
            try {
                response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Rooms);
            }
            catch (err) {
                response = err;
            }
            finally {
                chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
            }
        });
    });
    it("Shouldn't add a duplicate dataset", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const id = "courses";
            const id2 = "courses";
            let response;
            let response2;
            try {
                yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
                response2 = yield insightFacade.addDataset(id2, datasets[id2], IInsightFacade_1.InsightDatasetKind.Courses);
            }
            catch (err) {
                response2 = err;
            }
            finally {
                chai_1.expect(response2).to.be.instanceOf(IInsightFacade_1.InsightError);
            }
        });
    });
    it("Should be able to add a subdataset", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const id = "only1validcourse";
            const id2 = "cpsccourses2";
            let response;
            let response2;
            try {
                yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
                response2 = yield insightFacade.addDataset(id2, datasets[id2], IInsightFacade_1.InsightDatasetKind.Courses);
            }
            catch (err) {
                response2 = err;
            }
            finally {
                chai_1.expect(response2).to.deep.equal([id, id2]);
            }
        });
    });
    it("Shouldn't add a dataset with no corresponding concrete path", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const id = "courseshypothetical";
            let response;
            try {
                response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
            }
            catch (err) {
                response = err;
            }
            finally {
                chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
            }
        });
    });
    it("Shouldn't add a invalid dataset", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const id = "notZIP";
            let response;
            try {
                response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
            }
            catch (err) {
                response = err;
            }
            finally {
                chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
            }
        });
    });
    it("Should add a partial dataset", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const id2 = "courses";
            const id = "onecoursewithsection2";
            let response2;
            let response;
            try {
                yield insightFacade.addDataset(id2, datasets[id2], IInsightFacade_1.InsightDatasetKind.Courses);
                response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
            }
            catch (err) {
                response = err;
            }
            finally {
                chai_1.expect(response).to.deep.equal([id2, id]);
            }
        });
    });
    it("Shouldn't add a dataset with null input", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const id = null;
            let response;
            try {
                response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
            }
            catch (err) {
                response = err;
            }
            finally {
                chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
            }
        });
    });
    it("Shouldn't add a dataset with invalidJSON format", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const id = "invalidjson2";
            let response;
            try {
                response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
            }
            catch (err) {
                response = err;
            }
            finally {
                chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
            }
        });
    });
    it("Shouldn't add a dataset with \"\" format", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const id = "";
            let response;
            try {
                response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
            }
            catch (err) {
                response = err;
            }
            finally {
                chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
            }
        });
    });
    it("Shouldn't add a dataset with zero course section", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const id = "zerosection";
            let response;
            try {
                response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
            }
            catch (err) {
                response = err;
            }
            finally {
                chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
            }
        });
    });
    it("Should remove the courses dataset", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const id = "courses";
            let response;
            try {
                yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
                response = yield insightFacade.removeDataset(id);
            }
            catch (err) {
                response = err;
            }
            finally {
                chai_1.expect(response).to.deep.equal(id);
            }
        });
    });
    it("Shouldn't remove the same existing courses dataset more than once", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const id = "courses";
            let response;
            try {
                yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
                yield insightFacade.removeDataset(id);
                response = yield insightFacade.removeDataset(id);
            }
            catch (err) {
                response = err;
            }
            finally {
                chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.NotFoundError);
            }
        });
    });
    it("Shouldn't remove the dataset that is not added", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const id = "courses";
            let response;
            try {
                response = yield insightFacade.removeDataset(id);
            }
            catch (err) {
                response = err;
            }
            finally {
                chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.NotFoundError);
            }
        });
    });
    it("Shouldn't remove the dataset with no connected id", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const id = "courseshypothetical";
            let response;
            try {
                yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
                response = yield insightFacade.removeDataset(id);
            }
            catch (err) {
                response = err;
            }
            finally {
                chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
            }
        });
    });
    it("Should expect an error with null input", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const id = null;
            let response;
            try {
                yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
                response = yield insightFacade.removeDataset(id);
            }
            catch (err) {
                response = err;
            }
            finally {
                chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
            }
        });
    });
    it("Should expect an error with \"\" input", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const id = "";
            let response;
            try {
                yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
                response = yield insightFacade.removeDataset(id);
            }
            catch (err) {
                response = err;
            }
            finally {
                chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
            }
        });
    });
    it("Should list 2 valid datasets and length be 2", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const id = "courses";
            const id2 = "cpsccourses2";
            let response;
            try {
                yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
                yield insightFacade.addDataset(id2, datasets[id2], IInsightFacade_1.InsightDatasetKind.Courses);
                response = yield insightFacade.listDatasets();
            }
            catch (err) {
                response = err;
            }
            finally {
                chai_1.expect(response.length).to.be.equal(2);
            }
        });
    });
    it("Should list no dataset and length be 0", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            try {
                response = yield insightFacade.listDatasets();
            }
            catch (err) {
                response = err;
            }
            finally {
                chai_1.expect(response.length).to.be.equal(0);
            }
        });
    });
});
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery = {
        smalldataset: "./test/data/smalldataset.zip",
        courses: "./test/data/courses.zip"
    };
    let insightFacade;
    let testQueries = [];
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            Util_1.default.test(`Before: ${this.test.parent.title}`);
            try {
                testQueries = yield TestUtil_1.default.readTestQueries();
                chai_1.expect(testQueries).to.have.length.greaterThan(0);
            }
            catch (err) {
                chai_1.expect.fail("", "", `Failed to read one or more test queries. ${err}`);
            }
            try {
                insightFacade = new InsightFacade_1.default();
            }
            catch (err) {
                Util_1.default.error(err);
            }
            finally {
                chai_1.expect(insightFacade).to.be.instanceOf(InsightFacade_1.default);
            }
            try {
                const loadDatasetPromises = [];
                for (const [id, path] of Object.entries(datasetsToQuery)) {
                    loadDatasetPromises.push(TestUtil_1.default.readFileAsync(path));
                }
                const loadedDatasets = (yield Promise.all(loadDatasetPromises)).map((buf, i) => {
                    return { [Object.keys(datasetsToQuery)[i]]: buf.toString("base64") };
                });
                chai_1.expect(loadedDatasets).to.have.length.greaterThan(0);
                const responsePromises = [];
                const datasets = Object.assign({}, ...loadedDatasets);
                for (const [id, content] of Object.entries(datasets)) {
                    responsePromises.push(insightFacade.addDataset(id, content, IInsightFacade_1.InsightDatasetKind.Courses));
                }
                try {
                    const responses = yield Promise.all(responsePromises);
                    responses.forEach((response) => chai_1.expect(response).to.be.an("array"));
                }
                catch (err) {
                    Util_1.default.warn(`Ignoring addDataset errors. For D1, you should allow errors to fail the Before All hook.`);
                }
            }
            catch (err) {
                chai_1.expect.fail("", "", `Failed to read one or more datasets. ${JSON.stringify(err)}`);
            }
        });
    });
    beforeEach(function () {
        Util_1.default.test(`BeforeTest: ${this.currentTest.title}`);
    });
    after(function () {
        Util_1.default.test(`After: ${this.test.parent.title}`);
    });
    afterEach(function () {
        Util_1.default.test(`AfterTest: ${this.currentTest.title}`);
    });
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        let response;
                        try {
                            response = yield insightFacade.performQuery(test.query);
                        }
                        catch (err) {
                            response = err;
                        }
                        finally {
                            if (test.isQueryValid) {
                                chai_1.expect(response).to.deep.include.members(test.result);
                                chai_1.expect(response.length).to.deep.equal(test.result.length);
                            }
                            else {
                                switch (test.result) {
                                    case "InsightError":
                                        chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
                                        break;
                                    case "ResultTooLargeError":
                                        chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.ResultTooLargeError);
                                        break;
                                    case "NotFoundError":
                                        chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.NotFoundError);
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                    });
                });
            }
        });
    });
});
//# sourceMappingURL=InsightFacade.spec.js.map