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
    public sortRowsWithOneOrder(rowsbeforesorting: any[], order: string): any[] {
        if (order !== undefined) {
            let fullorder = order;
            rowsbeforesorting.sort(function (a, b) {
                let A = a[fullorder];
                let B = b[fullorder];
                if (A < B) {
                    return -1;
                }
                if (A > B) {
                    return 1;
                }
                return 0;
            });
        }
        return rowsbeforesorting;
    }
    public sortRowsWithObjOrder(rowsbeforesorting: any[], order: any): any {
        let self = this;
        let ascdirec = true;
        if (order["dir"] === "DOWN") {
            ascdirec = false;
        }
        if (rowsbeforesorting.length === 1) {
            return rowsbeforesorting;
        }
        for ( let i = order["keys"].length - 1 ; i >= 0; i--) {
            let cursorkey = order["keys"][i];
            rowsbeforesorting = self.mergeSort(rowsbeforesorting, cursorkey, ascdirec);
        }
        return rowsbeforesorting;
    }
    public mergeSort(unsortedArray: any, orderkey: string, dir: boolean) {
        let sortedArray: any[] = [...unsortedArray];
        const merge = (fir: number, sec: number, secsize: number) => {
            let firsave = fir;
            let firend = sec;
            let secend = sec + secsize;
            let temp: any[] = [];
            while (fir !== firend && sec !== secend) {
                if (sortedArray[fir][orderkey] <= sortedArray[sec][orderkey] && dir) {
                    temp.push(sortedArray[fir]);
                    fir++;
                } else if (sortedArray[fir][orderkey] >= sortedArray[sec][orderkey] && !dir) {
                    temp.push(sortedArray[fir]);
                    fir++;
                } else {
                    temp.push(sortedArray[sec]);
                    sec++;
                }
            }
            if (fir === firend) {
                while (sec !== secend) {
                    temp.push(sortedArray[sec]);
                    sec++;
                }
            } else {
                while (fir !== firend) {
                    temp.push(sortedArray[fir]);
                    fir++;
                }
            }
            for ( let i = 0; i < temp.length; i++) {
                sortedArray[firsave + i] = temp[i];
            }
        };
        const recursivemergeSort = (start: number, end: number) => {
            if (end - start < 1) { return; }
            let middle = Math.floor((start + end) / 2);
            recursivemergeSort(start, middle);
            recursivemergeSort(middle + 1, end);
            merge(start, middle + 1, end - middle);
        };
        recursivemergeSort(0, unsortedArray.length - 1);
        return sortedArray;
    }
}
