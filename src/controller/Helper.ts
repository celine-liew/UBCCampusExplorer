export default class Helper {
    public static helper(databaseinfo: string, userinput: string): boolean {
       if (databaseinfo === "" || userinput === "") {
           return false;
       }
       if (userinput.includes("*")) {
           if (userinput.indexOf("*") === 0 && userinput[userinput.length - 1] !== "*") {
               let userinputsub = userinput.substring(1, userinput.length);
               let startindex = databaseinfo.length - userinputsub.length;
               if (startindex < 0) {
                   return false;
               }
               let databaseinfosub = databaseinfo.substring(startindex, databaseinfo.length);
               return userinputsub === databaseinfosub;
           } else if (userinput.indexOf("*") === userinput.length - 1 ) {
               let userinputsub = userinput.substring(0, userinput.length - 1);
               let endindex = userinputsub.length;
               if (endindex > databaseinfo.length) {
                   return false;
               }
               let databaseinfosub = databaseinfo.substring(0, endindex);
               return userinputsub === databaseinfosub;
           } else if (userinput.indexOf("*") === 0 && userinput[userinput.length - 1] === "*") {
               let userinputsub = userinput.substring(1, userinput.length - 1);
               return databaseinfo.includes(userinputsub);
           }
       } else {
           return databaseinfo === userinput;
       }
    }
    public static keepcommon(array1: any[], array2: any[]): any[] {
        if (array1 === [] ) {return array1; }
        if (array2 === [] ) { return array2; } else {
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
        if (array1 === []) { return array2; } if (array2 === []) { return array1; } else {
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
