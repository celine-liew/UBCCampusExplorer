// tslint:disable
import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import * as JSZip from "jszip";
import { PassThrough } from "stream";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export interface IHash {
    [id: string]: [string];
}

export default class InsightFacade implements IInsightFacade {

public addHash: IHash = {};
public unzipContent: string[] = [];

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        const coursesKeys: string[] = ['Subject', 'Course', 'Avg', 'Professor', 'Title', 'Pass', 'Fail','Audit','id','Year'];
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
            const validCourseSections: Object[] = []
            files.forEach(file => {
                courseFile = JSON.parse(file); // if valid Json
                if (courseFile['result'].length >= 1){
                    courseFile['result'].forEach((cSection : any) => {
                        const validSection = coursesKeys.every((key) => {
                            return Object.keys(cSection).includes(key);
                        })
                        if (validSection) { // TO CONTINUE...


                            console.log("invalid" + cSection['id']);
                        }
                    })
                }
            })
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
        return Promise.reject("Not implemented.");
    }

    public listDatasets(): Promise<InsightDataset[]> {
        return Promise.reject("Not implemented.");
    }
}
