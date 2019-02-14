export default class QueryInfo {
    protected static query: any;
    protected static columnsToDisp: Set<string>;
    protected static groupKeys: Set<string>;
    protected static applykeys: Set<string>;
    protected static hasTransformation: boolean = false;
    protected static databasename: string;
    protected static isCourse: boolean;
    protected static order: any;
    public static recourses = new RegExp(/[^_]+_(avg|pass|fail|audit|year|dept|id|instructor|title|uuid)$/g);
    public static rerooms =
        new RegExp(/[^_]+_(lat|lon|seats|fullname|shortname|number|name|address|type|furniture|href)$/g);
    public static renumrooms = new RegExp(/[^_]+_(lat|lon|seats)$/g);
    public static resrooms = new RegExp(/[^_]+_(fullname|shortname|number|name|address|type|furniture|href)$/g);
    public static renumcourses = new RegExp(/[^_]+_(avg|pass|fail|audit|year)$/g);
    public static rescourses = new RegExp(/[^_]+_(dept|id|instructor|title|uuid)$/g);
}
