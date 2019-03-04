import Decimal from "decimal.js";

export default class ApplyAggregater {
    public static findSumInArray(array: any[], eachkey: any): number {
        let sum = new Decimal(0.0);
        array.forEach((eachrow) => {
            let value = new Decimal(eachrow[eachkey]);
            sum = sum.add(value);
        });
        return Number(sum.toFixed(2));
    }
    public static findMinInArray(array: any[], eachkey: any): number {
        let ret = array[0][eachkey];
        array.forEach((eachrow) => {
            if (eachrow[eachkey] < ret) {
                ret = eachrow[eachkey];
            }
        });
        return ret;
    }
    public static findMaxInArray(array: any[], eachkey: any): number {
        let ret = array[0][eachkey];
        array.forEach((eachrow) => {
            if (eachrow[eachkey] > ret) {
                ret = eachrow[eachkey];
            }
        });
        return ret;
    }
    public static findAvgInArray(array: any[], eachkey: any): number {
        let sum = new Decimal(0.0);
        array.forEach((eachrow) => {
            let value = new Decimal(eachrow[eachkey]);
            sum = sum.add(value);
        });
        let avg = sum.toNumber() / array.length;
        let ret = Number(avg.toFixed(2));
        return ret;
    }
    public static findCountInArray(array: any[], eachkey: any): number {
        let testset: Set<any> = new Set();
        array.forEach((eachrow) => {
            testset.add(eachrow[eachkey]);
        });
        return testset.size;
    }
    public static cmptAcrsEachrowinGroup(array: any[], realapplyobj: any) {
        let ret = array[0];
        Object.keys(realapplyobj).forEach((eachkey: any) => {
            let applyToken = Object.keys(realapplyobj[eachkey])[0];
            switch (applyToken) {
                case "MAX":
                    ret[eachkey] = ApplyAggregater.findMaxInArray(array, eachkey);
                    break;
                case "MIN":
                    ret[eachkey] = ApplyAggregater.findMinInArray(array, eachkey);
                    break;
                case "AVG":
                    ret[eachkey] = ApplyAggregater.findAvgInArray(array, eachkey);
                    break;
                case "COUNT":
                    ret[eachkey] = ApplyAggregater.findCountInArray(array, eachkey);
                    break;
                case "SUM":
                    ret[eachkey] = ApplyAggregater.findSumInArray(array, eachkey);
                    break;
            }
        });
        return ret;
    }

}
