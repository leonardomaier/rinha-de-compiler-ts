const fs = require('fs');

interface SourceLocation {
    start: number;
    end: number;
    filename: string;
};

interface ExpressionNode {
    kind: string;
    location: SourceLocation;
};

interface Str extends ExpressionNode {
    value: string;
};

interface Int extends ExpressionNode {
    value: number;
};

interface Bool extends ExpressionNode {
    value: boolean;
};

interface Print extends ExpressionNode {
    value: Term;
};

interface Void extends ExpressionNode {
    value: null;
};

interface Parameter extends ExpressionNode {
    text: string;
};

interface Var extends ExpressionNode {
    text: string;
};

interface Let extends ExpressionNode {
    name: Parameter;
    value: Term;
    next: Term;
};

type Types = Str | Int | Bool | Void | Print;
interface Binary {
    lhs: Term;
    op: BinaryOp;
    rhs: Term;
};

enum BinaryOp {
    Add = "Add",
    Sub = "Sub"
};

enum TermKindEnum {
    Str = "Str",
    Print = "Print",
    Int = "Int",
    Bool = "Bool",
    Binary = "Binary",
    Let = "Let",
    Var = "Var"
};

interface Term { [key: string]: any }

function struct<T>(term: Term): T {
    return {
        value: term.value,
        kind: term.kind,
        location: term.location
    } as T;
}

function evaluate(term: Term, scope: { [key: string]: any } = {}): Types {
    switch (term.kind) {
        case TermKindEnum.Str:
            return struct<Str>(term);
        case TermKindEnum.Int:
            return struct<Int>(term);
        case TermKindEnum.Bool:
            return struct<Bool>(term);
        case TermKindEnum.Let:
            const response = evaluate(term.value, scope);
            scope[term.name.text] = response.value;
            return evaluate(term.next, scope);
        case TermKindEnum.Var:
            const variableValue = scope[term.text];
            return struct<Types>({ ...term, value: variableValue });
        case TermKindEnum.Binary:
            switch (term.op) {
                case BinaryOp.Add:
                    const lhs = evaluate(term.lhs, scope);
                    const rhs = evaluate(term.rhs, scope);

                    if (lhs.kind === TermKindEnum.Int && rhs.kind === TermKindEnum.Int) {
                        return struct<Int>({ ...term, value: Number(lhs.value) + Number(rhs.value) });
                    }

                    if (lhs.kind === TermKindEnum.Str && rhs.kind === TermKindEnum.Str) {
                        return struct<Str>({ ...term, value: lhs.value.toString() + rhs.value.toString() });
                    }

                    if (lhs.kind === TermKindEnum.Int && rhs.kind === TermKindEnum.Str) {
                        return struct<Str>({ ...term, value: Number(lhs.value) + rhs.value.toString() });
                    }

                    if (lhs.kind === TermKindEnum.Str && rhs.kind === TermKindEnum.Int) {
                        return struct<Str>({ ...term, value: lhs.value.toString() + Number(rhs.value) });
                    }

                    if (lhs.kind === TermKindEnum.Var && rhs.kind === TermKindEnum.Var) {

                        const leftHandType = typeof lhs.value;
                        const rightHandType = typeof rhs.value;

                        if (leftHandType === 'string' || rightHandType === 'string') {
                            return struct<Str>({ ...term, value: lhs.value.toString() + rhs.value.toString() });
                        }

                        if (leftHandType === 'number' && rightHandType === 'number') {
                            return struct<Str>({ ...term, value: Number(lhs.value) + Number(rhs.value) });
                        }

                        return struct<Void>({ ...term, value: null });
                    }
            }

            return;
        case TermKindEnum.Print:
            const { value, kind } = evaluate(term.value, scope);

            if (kind === TermKindEnum.Str) {
                console.log(`${value}`);
                return;
            }

            if (kind === TermKindEnum.Int) {
                console.log(+value);
                return;
            }

            if (kind === TermKindEnum.Bool) {
                console.log(Boolean(value));
                return;
            }

            if (kind === TermKindEnum.Binary) {
                console.log(value);
                return;
            }

            return;
        default:
            return {} as Void;
    }

}

function main() {
    const stdin = fs.readFileSync('./examples/print_variable_sum.json');
    const program = JSON.parse(stdin.toString());
    console.log(evaluate(program.expression));
}

main();