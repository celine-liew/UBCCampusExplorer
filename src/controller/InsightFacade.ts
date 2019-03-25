// tslint:disable
import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind, ResultTooLargeError} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import { AssertionError, throws, deepStrictEqual } from "assert";
import Queryparser from "./Queryparser";
import { acceptParser } from "restify";
import * as JSZip from "jszip";
import * as fs from "fs-extra";
import { checkValidDatabase,processCoursesFile, saveDatasetList, parseFileNamesIfCoursesOrRoomstype, processBasedonInsightType } from "./HelperAddDataset";
const parse5 = require("parse5");
import { addListener } from "cluster";
import QueryValidator from "./QueryValidator";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export interface IHash {
    [id: string]: any[];
}

export interface EHash {
    [kind: string]: IHash;
}

export default class InsightFacade implements IInsightFacade {

public datasetsHash: EHash = {};
public addedDatabase: InsightDataset[] = [];

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        // console.log("here")
        const validSectionsOrRooms: any[] = [];
        const coursesKeys: string[] = ['Subject', 'Course', 'Avg', 'Professor', 'Title', 'Pass', 'Fail','Audit','id','Year'];
        // const coursesTranKeys: string[] = ['dept', 'id', 'avg', 'instructor', 'title', 'pass', 'fail','audit','uuid','year'];
        const fileNames: string[] = [];
        checkValidDatabase(id, content, kind);
        if ((this.datasetsHash) && (this.datasetsHash[InsightDatasetKind.Courses] && this.datasetsHash[InsightDatasetKind.Courses][id]) ||
        (this.datasetsHash[InsightDatasetKind.Rooms] && this.datasetsHash[InsightDatasetKind.Rooms][id])) {
                throw new InsightError("duplicate dataset id.");
            }
        return JSZip.loadAsync(content, {base64: true}).then((zip) => {
            const files: Promise<string>[] = [];
            zip.forEach((path, object) => {
                parseFileNamesIfCoursesOrRoomstype(path, object, files, fileNames);
            });
            if (!files.length) { // empty lists of files
                throw new InsightError("No Valid File");
            }
            return Promise.all(files);
        })
        .then( (files) => {
            // console.log("finiahed")
            return this.addValidFilesonly(files, fileNames, coursesKeys, validSectionsOrRooms, kind, id);

        }).then ( () => {
            // console.log("also");
            if (this.datasetsHash["courses"] && this.datasetsHash["rooms"]){
                let toReturn;
                let target: any = {};
                if (kind == "rooms"){
                    toReturn = Object.assign(target, (this.datasetsHash["courses"]));
                    toReturn = Object.assign(target, (this.datasetsHash["rooms"]) );
                } else {
                    toReturn = Object.assign(target, (this.datasetsHash["rooms"]));
                    toReturn = Object.assign(target, (this.datasetsHash["courses"]));
                }
                return Object.keys(toReturn);
            }
             else return Promise.resolve(Object.keys(this.datasetsHash[kind]));
        })
        .catch( (err) => {
            if (!(err instanceof InsightError)) {
                throw new InsightError(err);
            }
            throw err;
        }).catch( (err) => {
            throw err;
        });
    }

    private addValidFilesonly = async (files: string[], fileNames: string[],
        coursesKeys: string[], validSectionsOrRooms: any[], kind: InsightDatasetKind, id: string) => {
                await processBasedonInsightType(kind, files, coursesKeys, validSectionsOrRooms, fileNames);
                if (validSectionsOrRooms.length === 0) {
                    throw new InsightError("no valid sections in dataset.");
                } else {
                    if (!this.datasetsHash[kind]) {
                        this.datasetsHash[kind] = {};
                    }
                    this.datasetsHash[kind][id] = validSectionsOrRooms;
                    return saveDatasetList(this.datasetsHash);
                }
    };


    public removeDataset(id: string): Promise<string> {
        if (!id){ throw new InsightError ("null input");}
        if ((!this.datasetsHash.courses || this.datasetsHash.courses && !this.datasetsHash.courses[id]) && (
            !this.datasetsHash.rooms || this.datasetsHash.rooms && !this.datasetsHash.rooms[id])){
            throw new NotFoundError ("dataset not in list.");
        } else {
            try {
                if (this.datasetsHash.courses && this.datasetsHash.courses[id]){
                    delete this.datasetsHash.courses[id];
                } else if (this.datasetsHash.rooms && this.datasetsHash.rooms[id]){
                    delete this.datasetsHash.rooms[id];
                }
                this.addedDatabase = this.addedDatabase.filter(name => id != id);
                return Promise.resolve(id);
                } catch (err) {
                        if (err instanceof Error) {
                            throw new InsightError(err);
                        } throw err;
                }
        }
    }

    public listDatasets(): Promise<InsightDataset[]> {
        const outputList: InsightDataset[] = [];
        Object.keys(this.datasetsHash).forEach( courseOrRm => {
            const setIds = Object.keys(this.datasetsHash[courseOrRm]);
            setIds.forEach ((id) => {
                const num = this.datasetsHash[courseOrRm][id].length;
                let dataset: InsightDataset = {
                    'id': id,
                    "kind": courseOrRm === 'courses' ? InsightDatasetKind.Courses : InsightDatasetKind.Rooms,
                   'numRows': num,
                }
                // console.log("data: "+ dataset);
                outputList.push(dataset);
            })

        })
        // console.log("listtt: " + outputList);
        return Promise.resolve(outputList);
    }
    public performQuery(query: any): Promise <any[]> {
        const self = this;
        let finalresult: any[] = [];
        return new Promise(function (resolve, reject) {
            try {
                let queryvalidator: QueryValidator = new QueryValidator();
                let isCourse = queryvalidator.validatequery(query);
                let parser: Queryparser = new Queryparser(queryvalidator.queryinfo);
                let DATATYPE = "";
                if (isCourse) {
                    DATATYPE = "courses";
                } else {
                    DATATYPE = "rooms";
                }
                if (!self.datasetsHash[DATATYPE]){
                    const path = './data/savedDatasets.json';
                    let fs = require('fs');
                    if(fs.existsSync(path)) {
                        let jsonString = fs.readFileSync(path);
                        let diskDataSetHash = JSON.parse(jsonString);
                        self.datasetsHash[DATATYPE] = diskDataSetHash[DATATYPE];
                    }
                }
                if (isCourse) {
                    finalresult = parser.executeQuery(query, self.datasetsHash['courses']);
                } else {
                    finalresult = parser.executeQuery(query, self.datasetsHash['rooms']);
                }
            } catch (error) {
                if (error instanceof InsightError || error instanceof ResultTooLargeError) {
                    reject(error);
                } else {
                    reject (new InsightError(error));
                }
            }
            resolve(finalresult);
        });
    }

}
