// tslint:disable
import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind, ResultTooLargeError} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import { AssertionError } from "assert";
import Queryparser from "./queryparser";
import { acceptParser } from "restify";
import * as JSZip from "jszip";
import { PassThrough } from "stream";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export interface IHash {
    [id: string]: any[];
}

export default class InsightFacade implements IInsightFacade {

public addHash: IHash = {};
public unzipContent: string[] = [];
public validCourseSections: any[] = [];


    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        const addedDatabase: string[] = [];
        const coursesKeys: string[] = ['Subject', 'Course', 'Avg', 'Professor', 'Title', 'Pass', 'Fail','Audit','id','Year'];
        const coursesTranKeys: string[] = ['dept', 'id', 'avg', 'instructor', 'title', 'pass', 'fail','audit','uuid','year'];
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
                courseFile = JSON.parse(file); // if valid Json
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
            if (this.validCourseSections.length = 0){
                Promise.reject("no valid course sections in dataset.")
            } else {
                this.addHash[id] = this.validCourseSections;
                addedDatabase.push(id);
                Promise.resolve;
                return (addedDatabase);
            }
        })
        .catch(err => {
            if (err instanceof Error){
                throw new InsightError(err)
            }
            return err;
        }).catch(err => {
            return Promise.reject(err);
        })
    }
        // tslint:disable-next-line:align

        // { [key: string]: Type; }
    public removeDataset(id: string): Promise<string> {
        return Promise.reject("Not implemented.");
    }

    public performQuery(query: any): Promise <any[]> {
        const self = this;
        let finalresult: any[];
        const promise: Promise<string[]> = new Promise(function (resolve, reject) {
            try {
                self.validatequery(query);
                self.validateWhere(query["WHERE"]);
                self.validateOptions(query["OPTIONS"]);
                let parser = new Queryparser();
                finalresult = parser.excutequery(query, self.addHash);
                parser.clean();
            } catch (error) {
                if (error instanceof InsightError) {
                    reject(error);
                } else {
                    reject (new InsightError(error.toString()));
                }
            }
            resolve(finalresult);
        });
        return promise;
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
                throw new InsightError("Invalid query string");
            } else {
                optionpart["COLUMNS"].forEach((element: any) => {
                    if (typeof element !== "string") {
                        throw new InsightError("Invalid query string");
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
            if (s.length !== 1) {
                throw new InsightError("key doesn't match");
            } else if (s[0] !== element) {
                // console.log(s[0]);
                throw new InsightError("key doesn't match");
            } else {
                let re = new RegExp(/(?:(?!_).)*/g);
                let s = element.match(re);
                if ( Queryparser.getcurrentdataset() === undefined) {
                    Queryparser.setcurrentdataset(s[0]);
                } else if (Queryparser.getcurrentdataset() !== s[0]) {
                    throw new InsightError("Cannot query more than one dataset");
                } else {
                    Queryparser.columnstoshowpush(element);
                }
                return;
            }
        });
    }
    public checkorder(columns: string[], order: string) {
        let flag = false;
        columns.forEach((element) => {
            if (element === order) {
                Queryparser.setOrder(order);
                flag = true;
            }
        });
        if (!flag) {
            throw new InsightError("ORDER key must be in COLUMNS");
        }
        return;
    }

    public listDatasets(): Promise<InsightDataset[]> {
        return Promise.reject("Not implemented.");
    }
}
