export declare class XTree {
    name: string;
    attributes: {
        [name: string]: AttributeValue;
    };
    children: Array<Child>;
    constructor(name: string, attributes: {
        [name: string]: AttributeValue;
    }, children: Array<Child>);
}
export declare class Parameter {
    name: string;
    constructor(name: string);
}
export declare class CData {
    children: Array<string | Parameter>;
    constructor(children: Array<string | Parameter>);
}
export declare type AttributeValue = string | Parameter | Array<string | Parameter>;
export declare type Child = string | Parameter | XTree | CData;
export declare function x(name: string, attributes?: {
    [name: string]: AttributeValue;
} | Array<Child>, children?: Array<Child>): XTree;
export declare function compile(tree: XTree, params: Array<Parameter>, opts?: {
    declaration?: boolean;
    indent?: number;
}): Function;
export declare function param(name: string): Parameter;
export declare const cdata: (...params: (string | Parameter)[]) => CData;
