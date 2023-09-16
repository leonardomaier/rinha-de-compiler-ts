const fs = require('fs');

interface Node {
    kind: string;
};

interface SourceLocation extends Node {
    start: number;
    end: number;
    filename: string;
};

interface Str extends Node {
    value: string;
    location: SourceLocation;
};

interface Int extends Node {
    value: number;
    location: SourceLocation;
}

interface Print extends Node {
    value: Term;
};

interface Void extends Node {
    value: null;
};

type Types = Str | Int | Void | Print;

enum TermKindEnum {
    Str = "Str",
    Print = "Print",
    Int = "Int"
};

interface Term { [key: string]: any }

function struct<T>(term: Term): T {
    return {
        value: term.value,
        kind: term.kind,
        location: term.location
    } as T;
}

function evaluate(term: Term): Types {

    switch (term.kind) {
        case TermKindEnum.Str:
            return struct<Str>(term);
        case TermKindEnum.Int:
            return struct<Int>(term);
        case TermKindEnum.Print:
            const { value, kind } = evaluate(term.value);

            if (kind === TermKindEnum.Str) {
                console.log(`${value}`);
                return;
            }

            if (kind === TermKindEnum.Int) {
                console.log(+value);
                return;
            }

            return;
        default:
            return {} as Void;
    }

}

function main() {
    const stdin = fs.readFileSync('./examples/print_boolean.json');
    const program = JSON.parse(stdin.toString());
    console.log(evaluate(program.expression));
}

main();