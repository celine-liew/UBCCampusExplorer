import { expect } from "chai";
import * as fs from "fs-extra";

import {
    InsightError,
    InsightDatasetKind,
    NotFoundError,
    ResultTooLargeError, InsightDataset
} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";
// import {promises} from "fs";

// This should match the schema given to TestUtil.validate(..) in TestUtil.readTestQueries(..)
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any;  // make any to allow testing structurally invalid queries
    isQueryValid: boolean;
    result: any;
    filename: string;  // This is injected when reading the file
}

describe("InsightFacade Add/Remove Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the Before All hook.
    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        cpsccourses2: "./test/data/cpsccourses2.zip",
        nocourses: "./test/data/nocourses.zip",
        noncoursedatabase: "./test/data/wrongfile.png",
        invalidjson2: "./test/data/invalidjson2.zip",
        onecoursewithsection2: "./test/data/onecoursewithsection2.zip",
        zerosection: "./test/data/zerosectionsdataset.zip"
    };
    let insightFacade: InsightFacade;
    let datasets: { [id: string]: string };

    before(async function () {
        Log.test(`Before: ${this.test.parent.title}`);

        try {
            const loadDatasetPromises: Array<Promise<Buffer>> = [];
            for (const [id, path] of Object.entries(datasetsToLoad)) {
                loadDatasetPromises.push(TestUtil.readFileAsync(path));
            }
            const loadedDatasets = (await Promise.all(loadDatasetPromises)).map((buf, i) => {
                return { [Object.keys(datasetsToLoad)[i]]: buf.toString("base64") };
            });
            datasets = Object.assign({}, ...loadedDatasets);
            expect(Object.keys(datasets)).to.have.length.greaterThan(0);
        } catch (err) {
            expect. fail("", "", `Failed to read one or more datasets. ${JSON.stringify(err)}`);
        }

    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
        try {
            fs.removeSync("./data");
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        } finally {
            expect(insightFacade).to.be.instanceOf(InsightFacade);
        }
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // 1
    it("Should add a valid dataset", async function () {
        const id: string = "courses";
        let response: string[];

        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal([id]);
        }
    });
    it("Should not add a invalid dataset with wrong InsightDatasetKind identifier", async function () {
        const id: string = "cpsccourses2";
        let response: string[];

        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });
    // 2
    it("Shouldn't add a duplicate dataset", async function () {
        const id: string = "courses";
        const id2: string = "courses";
        let response: string[];
        let response2: string[];

        try {
            await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
            response2 = await insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
        } catch (err) {
            response2 = err;
        } finally {
            expect(response2).to.be.instanceOf(InsightError);
        }
    });
    // 2-2
    it("Should be able to add a subdataset", async function () {
        const id: string = "courses";
        const id2: string = "cpsccourses2";
        let response: string[];
        let response2: string[];

        try {
            await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
            response2 = await insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
        } catch (err) {
            response2 = err;
        } finally {
            expect(response2).to.deep.equal([id, id2]);
        }
    });
    // 3
    it("Shouldn't add a dataset with no corresponding concrete path", async function () {
        const id: string = "courseshypothetical";
        let response: string[];

        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });
    // 4
    it("Shouldn't add a invalid dataset", async function () {
        const id: string = "noncoursedatabase";
        let response: string[];

        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });
    // 5
    it("Should add a partial dataset", async function () {
        const id2: string = "courses";
        const id: string = "onecoursewithsection2";
        let response2: string[];
        let response: string[];

        try {
            await insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal([id2, id]);
        }
    });
    // 6
    it("Shouldn't add a dataset with null input", async function () {
        const id: string = null;
        let response: string[];

        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });
    // 7
    it("Shouldn't add a dataset with invalidJSON format", async function () {
        const id: string = "invalidjson2";
        let response: string[];

        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });
    // 8
    it("Shouldn't add a dataset with \"\" format", async function () {
        const id: string = "";
        let response: string[];

        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });
    // 9
    it("Shouldn't add a dataset with zero course section", async function () {
        const id: string = "zerosection";
        let response: string[];

        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });
    // This is an example of a pending test. Add a callback function to make the test run.
    it("Should remove the courses dataset", async function () {
        const id: string = "courses";
        let response: string;

        try {
            await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }

    });

    it("Shouldn't remove the same existing courses dataset more than once", async function () {
        const id: string = "courses";
        let response: string;

        try {
            await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
            await insightFacade.removeDataset(id);
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(NotFoundError);
        }

    });
    it("Shouldn't remove the dataset that is not added", async function () {
        const id: string = "courses";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(NotFoundError);
        }

    });

    it("Shouldn't remove the dataset with no connected id", async function () {
        const id: string = "courseshypothetical";
        let response: string;

        try {
            await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }

    });

    it("Should expect an error with null input", async function () {
        const id: string = null;
        let response: string;

        try {
            await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }

    });

    it("Should expect an error with \"\" input", async function () {
        const id: string = "";
        let response: string;

        try {
            await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }

    });
    it("Should list 2 valid datasets and length be 2", async function () {
        const id: string = "courses";
        const id2: string = "cpsccourses2";
        let response: InsightDataset[];
        try {
            await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
            await insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
            response = await insightFacade.listDatasets();
            // length = Promise<InsightDataset[]>.length;
            // await  insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response.length).to.be.equal(2);
            // expect(response).to.deep.equal([id]);
        }
    });
    it("Should list no dataset and length be 0", async function () {
        // const id: string = "courses";
        // const id2: string = "cpsccourses";
        let response: InsightDataset[];
        try {
            // await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
            // await insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
            response = await insightFacade.listDatasets();
            // length = Promise<InsightDataset[]>.length;
            // await  insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response.length).to.be.equal(0);
            // expect(response).to.deep.equal([id]);
        }
    });
});

// This test suite dynamically generates tests from the JSON files in test/queries.
// You should not need to modify it; instead, add additional files to the queries directory.
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        cpsccourses2: "./test/data/cpsccourses2.zip",
    };
    let insightFacade: InsightFacade;

    let testQueries: ITestQuery[] = [];

    // Create a new instance of InsightFacade, read in the test queries from test/queries and
    // add the datasets specified in datasetsToQuery.
    before(async function () {
        Log.test(`Before: ${this.test.parent.title}`);

        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = await TestUtil.readTestQueries();
            expect(testQueries).to.have.length.greaterThan(0);
        } catch (err) {
            expect.fail("", "", `Failed to read one or more test queries. ${err}`);
        }

        try {
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        } finally {
            expect(insightFacade).to.be.instanceOf(InsightFacade);
        }

        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Fail if there is a problem reading ANY dataset.
        try {
            const loadDatasetPromises: Array<Promise<Buffer>> = [];
            for (const [id, path] of Object.entries(datasetsToQuery)) {
                loadDatasetPromises.push(TestUtil.readFileAsync(path));
            }
            const loadedDatasets = (await Promise.all(loadDatasetPromises)).map((buf, i) => {
                return { [Object.keys(datasetsToQuery)[i]]: buf.toString("base64") };
            });
            expect(loadedDatasets).to.have.length.greaterThan(0);

            const responsePromises: Array<Promise<string[]>> = [];
            const datasets: { [id: string]: string } = Object.assign({}, ...loadedDatasets);
            for (const [id, content] of Object.entries(datasets)) {
                responsePromises.push(insightFacade.addDataset(id, content, InsightDatasetKind.Courses));
            }

            // This try/catch is a hack to let your dynamic tests execute even if the addDataset method fails.
            // In D1, you should remove this try/catch to ensure your datasets load successfully before trying
            // to run you queries.
            try {
                const responses: string[][] = await Promise.all(responsePromises);
                responses.forEach((response) => expect(response).to.be.an("array"));
            } catch (err) {
                Log.warn(`Ignoring addDataset errors. For D1, you should allow errors to fail the Before All hook.`);
            }
        } catch (err) {
            expect.fail("", "", `Failed to read one or more datasets. ${JSON.stringify(err)}`);
        }
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Dynamically create and run a test for each query in testQueries
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries.slice(90, 96)) {
                it(`[${test.filename}] ${test.title}`, async function () {
                    let response: any[];

                    try {
                        response = await insightFacade.performQuery(test.query);
                    } catch (err) {
                        response = err;
                    } finally {
                        if (test.isQueryValid) {
                            expect(response).to.deep.equal(test.result);
                        } else {
                            switch (test.result) {
                                case "InsightError":
                                    expect(response).to.be.instanceOf(InsightError);
                                    break;
                                case "ResultTooLargeError":
                                    expect(response).to.be.instanceOf(ResultTooLargeError);
                                    break;
                                case "NotFoundError":
                                    expect(response).to.be.instanceOf(NotFoundError);
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                });
            }
        });
    });
});
