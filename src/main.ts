const fs = require('fs');

type SourceLocation = {
    start: number;
    end: number;
    filename: string;
};

type Str = {
    kind: string,
    value: string;
    location: SourceLocation;
};

type Print = {
    kind: string;
    value: Term;
};

type Types = Str | Print;

enum TermKindEnum {
    Str = "Str",
    Print = "Print"
};

interface Term { [key: string]: any }

function struct<T>(params: T): T {
    return params;
}

function evaluate(term: Term): Types {

    switch(term.kind) {
        case TermKindEnum.Str:
            return struct<Str>({ 
                value: term.value.toString(), 
                kind: term.kind,
                location: term.location 
            });
        case TermKindEnum.Print:
            const { value, kind } = evaluate(term.value);

            if (kind === TermKindEnum.Str) {
                console.log(`${value}`);
                return;
            }

            return;
    }

}

function main() {

    const stdin = fs.readFileSync('./examples/print.json');

    const program = JSON.parse(stdin.toString());

    console.log(evaluate(program.expression));
}

main();