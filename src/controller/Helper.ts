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
}
