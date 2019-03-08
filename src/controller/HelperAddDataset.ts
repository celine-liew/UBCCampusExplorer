// tslint:disable
import {IInsightFacade, InsightDataset, InsightDatasetKind, ResultTooLargeError} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import * as fs from "fs-extra";
import { EHash } from "./InsightFacade";
import * as JSZip from "jszip";
import { findTableInIndex, findBuildingNameFromFile, addRoomsPerBuilding, processIfTrNode } from "./GetBuildingInfoHelper";
const parse5 = require("parse5");

export const checkValidDatabase = (id: string, content: string, kind: InsightDatasetKind): boolean => {
    if (!id || id === "") {
        throw new InsightError( "null input");
    }
    if (!content) {
        throw new InsightError( "Can't find database");
    }
    if (kind !== InsightDatasetKind.Courses && kind !== InsightDatasetKind.Rooms) { throw new InsightError("invalid InsightDatasetKind");
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

export const  parseFileNamesIfCoursesOrRoomstype = (path: string, object: JSZip.JSZipObject,
                                                    files: Array<Promise<string>>, fileNames: string[]) => {
        if ((path.startsWith("courses/") || path.startsWith("rooms/")) && !object.dir) {
            files.push(object.async("text")); // take files from courses folder only
            const allNamesSplit = object.name.split("/");
            fileNames.push(allNamesSplit.pop());
        }
};

<<<<<<< HEAD
export const checkDuplicateIDs = (kind: InsightDatasetKind, id: string) => {
        if (this.datasetsHash && this.datasetsHash[kind] && this.datasetsHash[kind][id]) {
            throw new InsightError("duplicate dataset id.");
        }
    };


=======
>>>>>>> fcfccc7facc211541e4c8549b1a2251fc2682501
export const processBasedonInsightType = async (kind: InsightDatasetKind, files: string[], coursesKeys: string[],
    validSectionsOrRooms: any[], fileNames: string[]) => {
    switch (kind) {
        case InsightDatasetKind.Courses:
            processCoursesFile(files, coursesKeys, validSectionsOrRooms);
            break;
        case InsightDatasetKind.Rooms:
            await this.processRoomsfiles(files, fileNames, validSectionsOrRooms);
    }
};

export const processRoomsfiles = async (files: any[], fileNames: string[], buildingValidRooms: any[])  =>{
    const listofBuildings: any = [];
    const tableToCheck = findTableInIndex(files, fileNames);
    for (const trNode of tableToCheck.childNodes) {
        let building: any = {};
        await processIfTrNode(trNode, building, listofBuildings);
    }
        files.forEach( (file) => {
            let listofRooms: any = [];
            let validRoomTemplate = {};
            const checkFile = parse5.parse(file);
            const fullname = findBuildingNameFromFile(checkFile, "");
            let inINdexHTM = false;
            let index = 0;
            for (let i = 0; i < listofBuildings.length; i++) {
                if (listofBuildings[i]["fullname"] === fullname) {
                    inINdexHTM = true;
                    index = i;
                }
            }
            if (inINdexHTM) {
                    validRoomTemplate = {
                        fullname: listofBuildings[index]["fullname"],
                        shortname: listofBuildings[index]["shortname"],
                        address: listofBuildings[index]["address"],
                        lat: listofBuildings[index]["lat"],
                        lon: listofBuildings[index]["lon"],
                    };
                    listofRooms =  addRoomsPerBuilding(checkFile, listofRooms, validRoomTemplate);
                    if (listofRooms.length > 0){
                        Array.prototype.push.apply(buildingValidRooms, listofRooms);
                    } else return;
                }
    });
    return buildingValidRooms;
}

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
        throw err;
    }
};
