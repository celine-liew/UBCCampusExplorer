import {IInsightFacade, InsightDataset, InsightDatasetKind, ResultTooLargeError} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import * as fs from "fs-extra";
import { EHash } from "./InsightFacade";

export const checkValidDatabase = (id: string, content: string, kind: InsightDatasetKind): boolean => {
    if (!id || id === "") {
        throw new InsightError( "null input");
    }
    if (!content) {
        throw new InsightError( "Can't find database");
    }
    if (kind !== InsightDatasetKind.Courses && kind !== InsightDatasetKind.Rooms) {
        throw new InsightError("invalid InsightDatasetKind");
    }
    return true;
};

export const processCoursesFile = (files: string[], coursesKeys: string[], validCourseSections: any[]) => {
        let courseFile;
        files.forEach( (file) => {
            try {
            courseFile = JSON.parse(file); // if valid Json
            } catch (err) {
                return; // skipping invalid "Error with JSON parsing";
            }
            if (courseFile["result"].length >= 1) {
                courseFile["result"].forEach((cSection: any) => {
                    const validSection = coursesKeys.every((key) => {
                        return Object.keys(cSection).includes(key);
                    });
                    if (validSection) { // TO CONTINUE...
                        const uuid = (cSection["id"]).toString();
                        let year = parseInt(cSection["Year"], 10);
                        if (cSection["Section"] === "overall") {
                            year = 1900;
                        }
                        const courseSection = {
                            dept: cSection["Subject"],
                            id: cSection["Course"],
                            avg: cSection["Avg"],
                            instructor: cSection["Professor"],
                            title: cSection["Title"],
                            pass: cSection["Pass"],
                            fail: cSection["Fail"],
                            audit: cSection["Audit"],
                            uuid: uuid,
                            year: year
                        };
                        validCourseSections.push(courseSection);
                    }
                });
            }
        });
        return validCourseSections;
    };

export const saveDatasetList = async (data: EHash) => {
    const outputFile = Object.keys(data).map((kind) => {
        return {kind: kind, id: data[kind]};
    });
    const dir = "./data";
    const filePath = "./data/savedDatasets.json";
    try {
        await fs.ensureDir(dir);
        await fs.writeJSON(filePath, outputFile);
    } catch (err) {
        // console.error(err);
        throw err;
    }
};
