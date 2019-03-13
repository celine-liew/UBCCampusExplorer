export default class RowSorter {
    public sortRowsWithOneOrder(rowsbeforesorting: any[], order: string): any[] {
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
