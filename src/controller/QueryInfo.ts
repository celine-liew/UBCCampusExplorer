
export default class QueryInfo {
    public query: any;
    public columnsToDisp: Set<string>;
    public groupKeys: Set<string>;
    public applykeys: Set<string>;
    public hasTransformation: boolean = false;
    public databasename: string;
    public isCourse: boolean;
    public order: any;
    public recourses = new RegExp(/[^_]+_(avg|pass|fail|audit|year|dept|id|instructor|title|uuid)$/g);
    public rerooms =
        new RegExp(/[^_]+_(lat|lon|seats|fullname|shortname|number|name|address|type|furniture|href)$/g);
    public renumrooms = new RegExp(/[^_]+_(lat|lon|seats)$/g);
    public resrooms = new RegExp(/[^_]+_(fullname|shortname|number|name|address|type|furniture|href)$/g);
    public renumcourses = new RegExp(/[^_]+_(avg|pass|fail|audit|year)$/g);
    public rescourses = new RegExp(/[^_]+_(dept|id|instructor|title|uuid)$/g);

    constructor(query: any) {
        this.query = query;
        this.applykeys = new Set<string>();
        this.groupKeys = new Set<string>();
        this.databasename = undefined;
        this.order = {};
        this.columnsToDisp = new Set<string>();
        this.hasTransformation = false;
        this.databasename = undefined;
        this.isCourse = false;
    }
}
