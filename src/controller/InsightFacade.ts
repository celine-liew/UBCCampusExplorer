// tslint:disable
import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind, ResultTooLargeError} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import { AssertionError, throws, deepStrictEqual } from "assert";
import Queryparser from "./Queryparser";
import { acceptParser } from "restify";
import * as JSZip from "jszip";
import { PassThrough } from "stream";
import * as fs from "fs-extra";
import { addListener } from "cluster";
import QueryValidator from "./QueryValidator";
import { checkValidDatabase, processCoursesFile, saveDatasetList } from "./HelperAddDataset";

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
public parser: Queryparser;
public queryvalidator: QueryValidator;
public addedDatabase: InsightDataset[] = [];

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        const validCourseSections: any[] = [];
        const coursesKeys: string[] = ['Subject', 'Course', 'Avg', 'Professor', 'Title', 'Pass', 'Fail','Audit','id','Year'];
        // const coursesTranKeys: string[] = ['dept', 'id', 'avg', 'instructor', 'title', 'pass', 'fail','audit','uuid','year'];
        checkValidDatabase(id, content, kind);
        if (this.datasetsHash && this.datasetsHash[kind] && this.datasetsHash[kind][id]) {
            throw new InsightError("duplicate dataset id.");
        }

        return JSZip.loadAsync(content, {base64: true}).then((zip) => {
            const files: Promise<string>[] = [];
            zip.forEach((path, object) => {
                if (path.startsWith("courses/") && !object.dir) { // check courses folder exist
                    files.push(object.async("text")); // take files from courses folder only
                }
            });
            if (!files.length) { // empty lists of files
                throw new InsightError("No Valid File");
            }
            return Promise.all(files);
        })
        .then( (files) => {
            this.addValidFilesonly(files, coursesKeys, validCourseSections, kind, id);

        }).then ( () => {
            return Object.keys(this.datasetsHash[kind]);
        })
        .catch( (err) => {
            if (!(err instanceof InsightError)) {
                throw new InsightError(err);
            }
            return err;
        }).catch( (err) => {
            return err;
        });
    }

    private addValidFilesonly(files: string[], coursesKeys: string[], validCourseSections: any[],
        kind: InsightDatasetKind, id: string) {
            processCoursesFile(files, coursesKeys, validCourseSections);
            if (validCourseSections.length === 0){
                throw new InsightError("no valid course sections in dataset.")
            } else {
                if (!this.datasetsHash[kind]) {
                    this.datasetsHash[kind] = {}
                }
                this.datasetsHash[kind][id] = validCourseSections;
                return saveDatasetList(this.datasetsHash);
            }
        }

    public removeDataset(id: string): Promise<string> {
        if (!id){
            throw new InsightError ("null input");
        } if (!this.datasetsHash.courses || this.datasetsHash.courses && !this.datasetsHash.courses[id]){
            throw new NotFoundError ("dataset not in list.");
        } else { try {
            delete this.datasetsHash.courses[id];
            this.addedDatabase = this.addedDatabase.filter(name => id != id);
            return Promise.resolve(id);
            } catch (err) {
                    if (err instanceof Error) {
                        throw new InsightError(err);
                    } return err;
            }
        }
    }

    public listDatasets(): Promise<InsightDataset[]> {
        // this.addedDatabase.push(dataset);
        const outputList: InsightDataset[] = [];
        Object.keys(this.datasetsHash).forEach( courseOrRm => {
            const setIds = Object.keys(this.datasetsHash[courseOrRm]);
            setIds.forEach ((id) => {
                const num = this.datasetsHash[courseOrRm][id].length;
                const dataset: InsightDataset = {
                    'id': id,
                    "kind": courseOrRm === 'courses' ? InsightDatasetKind.Courses : InsightDatasetKind.Rooms,
                   'numRows': num,
                }
                outputList.push(dataset);
            })

        })
        return Promise.resolve(outputList);
    }
    public performQuery(query: any): Promise <any[]> {
        const self = this;
        let finalresult: any[] = [];
        return new Promise(function (resolve, reject) {
            try {
                self.parser = new Queryparser();
                self.queryvalidator = new QueryValidator();
                self.queryvalidator.validatequery(query);
                finalresult = self.parser.executeQuery(query, self.datasetsHash['courses']);
            } catch (error) {
                if (error instanceof InsightError || error instanceof ResultTooLargeError) {
                    reject(error); } else { reject (new InsightError(error));
                }
            }
            resolve(finalresult);
        });
    }
    
}
