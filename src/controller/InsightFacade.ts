// tslint:disable
import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind, ResultTooLargeError} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import { AssertionError, throws, deepStrictEqual } from "assert";
import Queryparser from "./queryparser";
import { acceptParser } from "restify";
import * as JSZip from "jszip";
import { PassThrough } from "stream";
import * as fs from "fs-extra";
import { addListener } from "cluster";
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
                self.validatequery(query);
                self.validateWhere(query["WHERE"]);
                self.validateOptions(query["OPTIONS"]);
                finalresult = self.parser.excutequery(query, self.datasetsHash['courses']);
            } catch (error) {
                if (error instanceof InsightError || error instanceof ResultTooLargeError) {
                    reject(error); } else { reject (new InsightError(error));
                }
            }
            resolve(finalresult);
        });
    }
    public validatequery(query: any) {
        let keys: string[] = [];
        keys = Object.keys(query);
        if (keys.length >= 3) {
            throw new InsightError("Excess keys in query");
        } else {
            if (!query.hasOwnProperty("WHERE")) {
                // TODO for small database, may be valid
                throw new InsightError("Missing Where");
            } else if (!query.hasOwnProperty("OPTIONS")) {
                throw new InsightError("Missing Options");
            } else if (!(query["OPTIONS"].hasOwnProperty("COLUMNS"))) {
                throw new InsightError("Options Missing Columns");
            } else if (query["OPTIONS"]["COLUMNS"].length <= 0) {
                throw new InsightError("Columns must be an un-empty array");
            } else {
                return;
            }
        }
    }
    public validateWhere(wherepart: any) {
        if (typeof wherepart !== "object") { throw new InsightError("Where must be an object");
        // } else if (wherepart.length === 0) {
            // throw new InsightError("Where must be non-empty");
        } else if (Object.keys(wherepart).length > 1) {
            throw new InsightError("Excess keys in where");
        } else {
            return;
        }
    }
    public validateOptions(optionpart: any) {
        if (typeof optionpart !== "object") {
            throw new InsightError("Options must be an object"); } else { let keys = Object.keys(optionpart);
            if (!optionpart.hasOwnProperty("COLUMNS")) {
                //throw new InsightError("Missing Columns"); LINE IS NOT REACHED
            } if ((keys.length === 2 && !optionpart.hasOwnProperty("ORDER")) || keys.length >= 3) {
                throw new InsightError("Invalid keys in OPTIONS");
            } else if (optionpart.hasOwnProperty("ORDER") && typeof optionpart["ORDER"] !== "string") {
                throw new InsightError("Invalid ORDER type");
            } else if (!Array.isArray(optionpart["COLUMNS"])) {
                throw new InsightError("Invalid query string 0");
            } else {
                optionpart["COLUMNS"].forEach((element: any) => {
                    if (typeof element !== "string") {
                        throw new InsightError("Invalid query string 1");
                    } else {
                        let renum = new RegExp(/[^_]+_(dept|id|instructor|title|uuid|avg|pass|fail|audit|year)$/g);
                        if(! renum.test(element)) {
                            throw new InsightError("Invalid key " + element + " in COLUMNS")
                        }
                    }
                });
                this.checkcolumns(optionpart["COLUMNS"]);
                if (optionpart.hasOwnProperty("ORDER") && typeof optionpart["ORDER"] === "string") {
                    this.checkorder(optionpart["COLUMNS"], optionpart["ORDER"]);
                }
                return;
            }
        }
    }
    public checkcolumns(columns: string[]) {
        let self = this;
        self.parser.columnstoshow = new Set<string>();
        let databasename : string;
        let re = new RegExp(/[^_]+_(avg|pass|fail|audit|year|dept|id|instructor|title|uuid)$/g);
        // let regExp = new RegExp(/^.*?(?=_)/g);
        columns.forEach((element) => {
            let s = element.match(re);
            if (s.length !== 1 || s[0] !== element) { throw new InsightError("key doesn't match");
            } else {
                let s2 = s[0].split("_");
                if ( databasename === undefined) {
                    databasename = s2[0];
                    self.parser.columnstoshow.add(element);
                    self.parser.currentdatabasename = s2[0];
                } else if ( databasename !== s2[0]) {
                    throw new InsightError("Cannot query more than one dataset");
                } else {
                    self.parser.columnstoshow.add(element);
                }
                return;
            }
        });
    }
    public checkorder(columns: string[], order: string) {
        let flag = false;
        let self = this;
        columns.forEach((element) => {
            if (element === order) {
                self.parser.order = element;
                flag = true;
            }
        });
        if (!flag) {
            throw new InsightError("ORDER key must be in COLUMNS");
        }
        return;
    }
}
