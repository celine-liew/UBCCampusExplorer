interface IFilter {
    FilterKey: ILogicComparison|IMathComparison|IStringComparison|INegation;
    nodes?: IFilter[];
}
interface ILogicComparison {
    keytype: LogicOperator;
    value: Array<ILogicComparison|IMathComparison|IStringComparison|INegation>; /*length>=1*/
}
enum LogicOperator {
    AND = "AND",
    OR = "OR",
}
interface IMathComparison {
    keytype: MathOperator;
    value: [string, string, number]; // databasename, attributename, atrribute value
}
enum MathOperator {
    LT = "LT",
    GT = "GT",
    EQ = "EQ"
}
interface IStringComparison {
    keytype: "IS";
    value: [string, string, string]; // databasename, attributename, atrribute value
}
interface INegation {
    keytype: "NOT";
    value: ILogicComparison|IMathComparison|IStringComparison|INegation;
}
