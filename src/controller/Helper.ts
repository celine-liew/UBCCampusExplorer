export default class Helper {
    public static helper(databaseinfo: string, userinput: string): boolean {
       if (userinput.includes("*")) {
           if (userinput.indexOf("*") === 0 && userinput[userinput.length - 1] !== "*") {
               let j = userinput.length - 1;
               let i = databaseinfo.length - 1;
               while (j > 0) {
                   if (j > 1 && i === 0) {return false; }
                   if (databaseinfo[i] === userinput[j]) {
                       j--;
                       i--;
                   } else {
                       return false;
                   }
               }
               return true;
           } else if (userinput.indexOf("*") === userinput.length - 1 ) {
               let i = 0;
               let j = 0;
               while (j < userinput.length - 1) {
                   if (j < userinput.length - 2 && i === databaseinfo.length - 1) {
                       return false;
                   }
                   if (databaseinfo[i] === userinput[j]) {
                       i++;
                       j++;
                   } else {
                       return false;
                   }
               }
               return true;
           } else if (userinput.length === 2) {
               return true;
           } else {
               return databaseinfo.includes(userinput);
           }
       } else {
           return databaseinfo === userinput;
       }
    }
    public static keepcommon(array1: any[], array2: any[]): any[] {
        if (array1 === null ) {
            return array1;
        } else if (array2 === null ) {
            return array2;
        } else {
            let set = new Set();
            let ret: any[] = [];
            array1.forEach((element) => {
                set.add(element);
            });
            array2.forEach((element) => {
                if (set.has(element)) {
                    ret.push(element);
                }
            });
            return ret;
        }
    }
    public static keepboth(array1: any[], array2: any[]) {
        if (array1 === undefined) {
            return array2;
        } else if (array2 === undefined) {
            return array1;
        } else {
            let set = new Set();
            let ret = array1;
            array1.forEach((element) => {
                set.add(element);
            });
            array2.forEach((element) => {
                if (!set.has(element)) {
                    ret.push(element);
                }
            });
            return ret;
        }
    }
}
