const fs = require('fs');

type SourceLocation = {
    start: number;
    end: number;
    filename: string;
};

type Str = {
    kind: string;
    value: string;
    location: SourceLocation;
};

type Int = {
    kind: string;
    value: number;
    location: SourceLocation;
}

type Print = {
    kind: string;
    value: Term;
};

type Types = Str | Int | Print;

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

    switch(term.kind) {
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
    }

}

function main() {
    const stdin = fs.readFileSync('./examples/print_int.json');
    const program = JSON.parse(stdin.toString());
    console.log(evaluate(program.expression));
}

main();