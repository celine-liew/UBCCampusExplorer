interface IFilter {
    FilterKey: string;
    value: any[];
    nodes: IFilter[];
}
// interface ILogicComparison {
//     keytype: string;
//     // value: null; /*length>=1*/
// }
// // enum LogicOperator {
// //     "AND",
// //     "OR",
// // }
// interface IMathComparison {
//     keytype: string;
//     // value: [string, string, number]; // databasename, attributename, atrribute value
// }
// // enum MathOperator {
// //     "LT",
// //     "GT",
// //     "EQ"
// // }
// interface IStringComparison {
//     keytype: string; // IS
//     // value: [string, string, string]; // databasename, attributename, atrribute value
// }
// interface INegation {
//     keytype: string; // NOT
//     // value: null;
// }
