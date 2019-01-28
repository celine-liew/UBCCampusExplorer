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

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export interface IHash {
    [id: string]: any[];
}

interface EHash {
    [kind: string]: IHash;
}

// type EHash ={
//     [kind in InsightDatasetKind]: IHash;
// }

export default class InsightFacade implements IInsightFacade {

public datasetsHash: EHash = {};
public validCourseSections: any[] = [];
public databasename: string = undefined;
public parser: Queryparser = new Queryparser();
public addedDatabase: InsightDataset[] = [];

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        const datasetToAdd: IHash = {};
        const coursesKeys: string[] = ['Subject', 'Course', 'Avg', 'Professor', 'Title', 'Pass', 'Fail','Audit','id','Year'];
        // const coursesTranKeys: string[] = ['dept', 'id', 'avg', 'instructor', 'title', 'pass', 'fail','audit','uuid','year'];
        if (!id || id === ""){
            throw new InsightError( "null input");
        }
        if (!content) {
            throw new InsightError( "Can't find database");
        }
        if (kind != InsightDatasetKind.Courses){
            throw new InsightError("invalid InsightDatasetKind");
        }
        if (this.datasetsHash && this.datasetsHash[kind] && this.datasetsHash[kind][id]){
            throw new InsightError("duplicate dataset id.");
        }
        return JSZip.loadAsync(content, {base64: true}).then(zip => {
            const files: Promise<string>[] = [];

            zip.forEach((path, object) => {
                if (path.startsWith('courses/') && !object.dir) { // check courses folder exist
                    files.push(object.async("text")); // take files from courses folder only
                }
            })

            if (!files.length){ // empty lists of files
                throw new InsightError("No Valid File");
            }
            return Promise.all(files);
        })
        .then(files => {
            let courseFile;

            files.forEach(file => {
                try {
                courseFile = JSON.parse(file) // if valid Json
                } catch (err) {
                    throw new InsightError("Error with JSON parsing");
                }
                if (courseFile['result'].length >= 1){
                    courseFile['result'].forEach((cSection : any) => {
                        const validSection = coursesKeys.every((key) => {
                            return Object.keys(cSection).includes(key);
                        })
                        if (validSection) { // TO CONTINUE...
                            const uuid = (cSection['id']).toString();
                            let year = parseInt(cSection['Year']);
                            if (cSection['Section'] === "overall"){
                                year = 1900;
                            }
                            const courseSection = {
                                'dept': cSection['Subject'],
                                'id': cSection['Course'],
                                'avg': cSection['Avg'],
                                'instructor': cSection['Professor'],
                                'title': cSection['Title'],
                                'pass': cSection['Pass'],
                                'fail': cSection['Fail'],
                                'audit': cSection['Audit'],
                                'uuid': uuid,
                                'year': year
                            }
                            this.validCourseSections.push(courseSection);
                            //console.log(this.validCourseSections[0]);
                        }
                    })
                }
            })
            if (this.validCourseSections.length === 0){
                throw new InsightError("no valid course sections in dataset.")
            } else {
                if (!this.datasetsHash[kind]) {
                    this.datasetsHash[kind] = {}
                }
                this.datasetsHash[kind][id] = this.validCourseSections;
                return this.saveDatasetList();
            }
        }).then ( () => {
            return Object.keys(this.datasetsHash[kind]);
        })
        .catch(err => {
            if (err !instanceof InsightError || err !instanceof NotFoundError){
                throw new InsightError(err);
            }
            return err;
        }).catch(err => {
            return err;
        })
    }
    public removeDataset(id: string): Promise<string> {
        if (!id){
            throw new InsightError ("null input");
        } if (!this.datasetsHash.courses || this.datasetsHash.courses && !this.datasetsHash.courses[id]){
            throw new NotFoundError ("dataset not in list.");
        } else {
            try {
            delete this.datasetsHash.courses[id];
            this.addedDatabase = this.addedDatabase.filter(name => id != id);

            return Promise.resolve(id);
            } catch (err) {
                    if (err instanceof Error) {
                        throw new InsightError(err);
                    }
                    return err;
            }
        }
    }

    public async saveDatasetList() {
        const data = this.datasetsHash;
        const outputFile = Object.keys(data).map((kind) => {
            return {kind: kind, id: data[kind]}});
        const dir = "./data"
        const filePath = "./data/savedDatasets.json"
        try {
            await fs.ensureDir(dir);
            await fs.writeJSON(filePath, outputFile)
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    public listDatasets(): Promise<InsightDataset[]> {

        // this.addedDatabase.push(dataset);
        const outputList: InsightDataset[] = [];
        Object.keys(this.datasetsHash).forEach( courseOrRm => {
            const setIds = Object.keys(this.datasetsHash[courseOrRm]);
            setIds.forEach ((id) => {
                const dataset: InsightDataset = {
                    'id': id,
                    "kind": courseOrRm === 'courses' ? InsightDatasetKind.Courses : InsightDatasetKind.Rooms,
                    'numRows': setIds.length,
                }
                outputList.push(dataset);
            })

        })
        return Promise.resolve(outputList);
    }

    public performQuery(query: any): Promise <any[]> {
        const self = this;
        let finalresult: any[];
        return new Promise(function (resolve, reject) {
            try {
                self.validatequery(query);
                self.validateWhere(query["WHERE"]);
                self.validateOptions(query["OPTIONS"]);
                finalresult = self.parser.excutequery(query, self.datasetsHash['courses'], self.databasename);
                self.parser.clean();
            } catch (error) {
                if (error instanceof InsightError) {
                    reject(error);
                } else {
                    reject (new InsightError(error.toString()));
                }
            }
            resolve(finalresult);
        });
    }
    public validatequery(query: any) {
        // let queryobj = JSON.parse(JSON.stringify(query));
        // let queryobj = query;
        let keys: string[] = [];
        // this function gets all the keys as an array of queryobj
        keys = Object.keys(query);
        // if the queryobj has more than three keys, it must be invalid
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
        if (typeof wherepart !== "object") {
            throw new InsightError("Where must be an object");
        } else if (wherepart.length === 0) {
            throw new InsightError("Where must be non-empty");
        } else if (Object.keys(wherepart).length > 1) {
            throw new InsightError("Excess keys in where");
        } else {
            return;
        }
    }
    public validateOptions(optionpart: any) {
        if (typeof optionpart !== "object") {
            throw new InsightError("Options must be an object");
        } else {
            let keys = Object.keys(optionpart);
            if (keys.length >= 3) {
                throw new InsightError("Excess keys in options");
            } else if (!optionpart.hasOwnProperty("COLUMNS")) {
                throw new InsightError("Missing Columns");
            } else if (keys.length === 2 && !optionpart.hasOwnProperty("ORDER")) {
                throw new InsightError("Invalid keys in OPTIONS");
            } else if (optionpart.hasOwnProperty("ORDER") && typeof optionpart["ORDER"] !== "string") {
                throw new InsightError("Invalid ORDER type");
            } else if (!Array.isArray(optionpart["COLUMNS"])) {
                throw new InsightError("Invalid query string 0");
            } else {
                optionpart["COLUMNS"].forEach((element: any) => {
                    if (typeof element !== "string") {
                        throw new InsightError("Invalid query string 1");
                    }
                });
                this.checkcolumns(optionpart["COLUMNS"]);
                if (optionpart["ORDER"]) {
                    this.checkorder(optionpart["COLUMNS"], optionpart["ORDER"].toString());
                }
                return;
            }
        }
    }
    public checkcolumns(columns: string[]) {
        columns.forEach((element) => {
            let re = new RegExp(/[^_]+_(avg|pass|fail|audit|year|dept|id|instructor|title|uuid)$/g);
            let s = element.match(re);
            // console.log(s[0]);
            // console.log(s.length);
            if (s.length !== 1) {
                throw new InsightError("key doesn't match");
            } else if (s[0] !== element) {
                // console.log(s[0]);
                throw new InsightError("key doesn't match");
            } else {
                let re2 = new RegExp(/(?:(?!_).)*/g);
                let s2 = element.match(re2);
                // console.log(s2[0]);
                // console.log(s2.length);
                if ( this.databasename === undefined) {
                    this.databasename = s2[0];
                } else if ( this.databasename !== s2[0]) {
                    throw new InsightError("Cannot query more than one dataset 1");
                } else {
                    this.parser.columnstoshow.add(element);
                }
                return;
            }
        });
    }
    public checkorder(columns: string[], order: string) {
        let flag = false;
        columns.forEach((element) => {
            if (element === order) {
                this.parser.order = element;
                flag = true;
            }
        });
        if (!flag) {
            throw new InsightError("ORDER key must be in COLUMNS");
        }
        return;
    }
}
