import {InsightError} from "./IInsightFacade";
// import "./QueryInfo";
import {QueryInfo} from "./QueryInfo";
export default class QueryValidator  {
    public queryinfo: QueryInfo;
    public validatequery(query: any): boolean {
    // ** code removed to adhere to collaboration policy
    // * and to benefit future cohorts */
            this.validateWhere(query["WHERE"]);
            this.validateOptions(query["OPTIONS"]);
            return this.queryinfo.isCourse;
        }
    public validateWhere(wherepart: any) {
       // ** code removed to adhere to collaboration policy
    // * and to benefit future cohorts */
    }
    public validateOptions(optionpart: any) {
        // ** code removed to adhere to collaboration policy
    // * and to benefit future cohorts */
    }
    public checkorder(columns: Set<string>, order: any) {
        // ** code removed to adhere to collaboration policy
    // * and to benefit future cohorts */
        this.queryinfo.order = order;
    }
    public checkOrderObj(columns: Set<string>, order: any) {
       // ** code removed to adhere to collaboration policy
    // * and to benefit future cohorts */
    }
}
