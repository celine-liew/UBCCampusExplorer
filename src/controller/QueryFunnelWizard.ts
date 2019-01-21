interface IFilter {
    FilterKey: ILogicComparison|IMathComparison|IStringComparison|INegation;
    nodes?: IFilter[];
}
interface ILogicComparison {
    key: LogicOperator;
    value: IFilter[];
}
enum LogicOperator {
    "AND",
    "OR",
}
interface IMathComparison {
    key: MathOperator;
    value: [string, number];
}
enum MathOperator {
    "LT",
    "GT",
    "EQ"
}
interface IStringComparison {
    key: "IS";
    value: [string, string];
}
interface INegation {
    key: "NOT";
    value: IFilter;
}
