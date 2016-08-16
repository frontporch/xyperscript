import * as xyperscript from '../src/index';

// I don't feel like making typescript happy here
declare var describe: any;
declare var it: any;
declare var require: any;

const rewire = require('rewire');
const alternate = rewire('../src/index');
const expect = require('chai').expect;


const Parameter: xyperscript.Parameter = alternate.Parameter;
const XTree: xyperscript.XTree = alternate.XTree;
const CData: xyperscript.CData = alternate.CData;

// function types :(
let x = xyperscript.x;
x = alternate.x as any;

let param = xyperscript.param;
param = alternate.param as any;

let cdata = xyperscript.cdata;
cdata = alternate.cdata as any;

let compile = xyperscript.compile;
compile = alternate.compile as any;

const flattenImp = alternate.__get__('flatten');
const concatImp = alternate.__get__('concat');

function flatten(tree: xyperscript.XTree): Array<string | xyperscript.Parameter> {
    const result = [];
    flattenImp(result, 0, tree);
    return concat(result);
}

function concat<T>(items: Array<string | T>): Array<string | T> {
    concatImp(items);
    return items;
}

const join = function join() {
    return [].join.call(arguments, '');
} as any as (...args: string[]) => string;

describe('xyperscript', () => {
    describe('XTree', () => {
        it('should handle basics', () => {
            expect(flatten(x('foo', ['bar']))).to.eql([
                '<foo>bar</foo>',
            ]);

            expect(flatten(x('foo', {}, ['bar']))).to.eql([
                '<foo>bar</foo>',
            ]);

            expect(flatten(x('foo', { a: 'b' }, ['bar']))).to.eql([
                '<foo a="b">bar</foo>',
            ]);
        });

        it('should indent things', () => {
            expect(flatten(x('foo', [x('bar', [''])]))).to.eql([
                join(
                    '<foo>',
                    '\n\t<bar></bar>',
                    '\n</foo>')
            ]);

            expect(flatten(x('foo', [
                x('bar', ['']),
                x('bop', ['baz']),
                x('stuff', [x('things')]),
            ]))).to.eql([
                join(
                    '<foo>',
                    '\n\t<bar></bar>',
                    '\n\t<bop>baz</bop>',
                    '\n\t<stuff>',
                    '\n\t\t<things/>',
                    '\n\t</stuff>',
                    '\n</foo>')
            ]);
        });

        it('should self close things', () => {
            expect(flatten(x('foo', [x('bar')]))).to.eql([
                join(
                    '<foo>',
                    '\n\t<bar/>',
                    '\n</foo>')
            ]);

            expect(flatten(x('foo', [x('bar'), x('bop')]))).to.eql([
                join(
                    '<foo>',
                    '\n\t<bar/>',
                    '\n\t<bop/>',
                    '\n</foo>')
            ]);

            const a = param('a');
            expect(flatten(x('foo', { a: a }))).to.eql([
                '<foo a="', a, '"/>',
            ]);

            expect(flatten(x('foo', [null, undefined as any, {} as any, 1 as any]))).to.eql([
                '<foo/>',
            ]);
        });

        it('should support parameters', () => {
            const a = param('a');
            expect(flatten(x('foo', [a]))).to.eql([
                '<foo>',
                a,
                '</foo>',
            ]);

            expect(flatten(x('foo', { a: a }, ['']))).to.eql([
                '<foo a="', a, '"></foo>',
            ]);

            expect(flatten(x('foo', { _: '0', a: a }))).to.eql([
                '<foo _="0" a="', a, '"/>',
            ]);

            expect(flatten(x('foo', { a: a, _: '0' }))).to.eql([
                '<foo a="', a, '" _="0"/>',
            ]);

            const b = param('b');
            expect(flatten(x('foo', { a: [a, b] }))).to.eql([
                '<foo a="', a, b, '"/>',
            ]);

            expect(flatten(x('foo', [a, b]))).to.eql([
                '<foo>', a, b, '</foo>',
            ]);

            expect(flatten(x('foo', [a, x('bar'), b]))).to.eql([
                '<foo>', a, '\n\t<bar/>', b, '\n</foo>',
            ]);
        });

        it('should ignore invalid children', () => {
            const a = param('a');
            expect(flatten(x('foo', ['bar', null, a]))).to.eql([
                '<foo>bar', a, '</foo>',
            ]);
            expect(flatten(x('foo', ['bar', 0 as any, a]))).to.eql([
                '<foo>bar', a, '</foo>',
            ]);
            expect(flatten(x('foo', ['bar', {} as any, a]))).to.eql([
                '<foo>bar', a, '</foo>',
            ]);
            expect(flatten(x('foo', ['bar', undefined as any, a]))).to.eql([
                '<foo>bar', a, '</foo>',
            ]);
        });

        it('should ignore invalid attributes', () => {
            const a = param('a');
            expect(flatten(x('foo', { a: a }))).to.eql([
                '<foo a="', a, '"/>'
            ]);

            expect(flatten(x('foo', { a: a, b: '' }))).to.eql([
                '<foo a="', a, '" b=""/>'
            ]);

            expect(flatten(x('foo', { a: a, b: null }))).to.eql([
                '<foo a="', a, '"/>'
            ]);

            expect(flatten(x('foo', { a: a, b: 0 as any }))).to.eql([
                '<foo a="', a, '"/>'
            ]);

            expect(flatten(x('foo', { a: a, b: {} as any }))).to.eql([
                '<foo a="', a, '"/>'
            ]);

            expect(flatten(x('foo', { a: a, b: x('bar') as any }))).to.eql([
                '<foo a="', a, '"/>'
            ]);

            expect(flatten(x('foo', { a: a, b: cdata('bar') as any }))).to.eql([
                '<foo a="', a, '"/>'
            ]);
        });
    });

    describe('cdata', () => {
        it('should work', () => {
            expect(flatten(x('foo', [cdata('bar')]))).to.eql([
                '<foo><![CDATA[bar]]></foo>',
            ]);

            const a = param('a');
            expect(flatten(x('foo', [cdata('bar', a)]))).to.eql([
                '<foo><![CDATA[bar', a, ']]></foo>',
            ]);
            expect(flatten(x('foo', [cdata(a, 'bar')]))).to.eql([
                '<foo><![CDATA[', a, 'bar]]></foo>',
            ]);
        });

        it('should ignore non string and non Parameter values', () => {
            const a = param('a');
            expect(flatten(x('foo', [cdata('bar', null, a)]))).to.eql([
                '<foo><![CDATA[bar', a, ']]></foo>',
            ]);
            expect(flatten(x('foo', [cdata('bar', 0 as any, a)]))).to.eql([
                '<foo><![CDATA[bar', a, ']]></foo>',
            ]);
            expect(flatten(x('foo', [cdata('bar', x('bop') as any, a)]))).to.eql([
                '<foo><![CDATA[bar', a, ']]></foo>',
            ]);
            expect(flatten(x('foo', [cdata('bar', undefined as any, a)]))).to.eql([
                '<foo><![CDATA[bar', a, ']]></foo>',
            ]);
        });
    });

    describe('concat', () => {
        it('should concatenate arrays with only strings', () => {
            expect(concat(['a'])).to.eql(['a']);
            expect(concat(['a', 'b'])).to.eql(['ab']);
            expect(concat(['a', 'b', 'c'])).to.eql(['abc']);
            expect(concat(['a', 'b', 'c', 'd'])).to.eql(['abcd']);
        });

        it('should concatenate mixed arrays', () => {
            expect(concat(['a', 1])).to.eql(['a', 1]);
            expect(concat(['a', 1, 'b'])).to.eql(['a', 1, 'b']);
            expect(concat(['a', 'b', 1])).to.eql(['ab', 1]);
            expect(concat(['a', 1, 'b', 1, 'c'])).to.eql(['a', 1, 'b', 1, 'c']);
            expect(concat(['a', 1, 1, 'b', 'c'])).to.eql(['a', 1, 1, 'bc']);
            expect(concat(['a', 'b', 1, 1, 'c'])).to.eql(['ab', 1, 1, 'c']);
            expect(concat(['a', 1, 1, 'b', 1, 1, 'c'])).to.eql(['a', 1, 1, 'b', 1, 1, 'c']);
            expect(concat(['a', 1, 1, 1, 'b', 'c'])).to.eql(['a', 1, 1, 1, 'bc']);
            expect(concat(['a', 'b', 1, 1, 1, 'c'])).to.eql(['ab', 1, 1, 1, 'c']);
        });
    });

    describe('compile', () => {
        it('should create xml producer', () => {
            const a = param('a');
            let func = compile(x('foo'), []);
            expect(func()).to.eql('<?xml version="1.0" encoding="UTF-8"?>\n<foo/>');

            func = compile(x('foo', [a]), [a]);
            expect(func('stuff')).to.eql('<?xml version="1.0" encoding="UTF-8"?>\n<foo>stuff</foo>');

            func = compile(
                x('foo', [
                    x('bar', { a: a }),
                    x('bop', [ a ]),
                    x('baz', [
                        x('stuff', [a]),
                        x('things', [a]),
                    ]),
                ]),
                [a]);
            expect(func('stuff')).to.eql([
                '<?xml version="1.0" encoding="UTF-8"?>',
                '<foo>',
                '\t<bar a="stuff"/>',
                '\t<bop>stuff</bop>',
                '\t<baz>',
                '\t\t<stuff>stuff</stuff>',
                '\t\t<things>stuff</things>',
                '\t</baz>',
                '</foo>',
            ].join('\n'));
        });

        it('honor options', () => {
            let func: Function;

            func = compile(x('foo'), [], { declaration: true });
            expect(func()).to.eql('<?xml version="1.0" encoding="UTF-8"?>\n<foo/>');

            func = compile(x('foo'), [], { declaration: false });
            expect(func()).to.eql('<foo/>');

            func = compile(x('foo'), [], { indent: 1 });
            expect(func()).to.eql('<?xml version="1.0" encoding="UTF-8"?>\n\t<foo/>');

            func = compile(x('foo'), [], { indent: 1, declaration: false });
            expect(func()).to.eql('\n\t<foo/>');
        });

        it('optionally encodes non-variables', () => {
            let func: Function;

            const expected = [
                '<foo stuff="a">',
                '\t<bar><![CDATA[things]]></bar>',
                '</foo>',
            ].join('\n');

            func = compile(x('foo', { stuff: 'a' }, [x('bar', [cdata('things')])]), [], { declaration: false, encode: encodeURIComponent });
            // paranoia, yes
            expect(decodeURIComponent(func())).to.eql(expected);
            expect(func()).to.eql(encodeURIComponent(expected));

            const things = param('things');
            func = compile(x('foo', { stuff: 'a' }, [x('bar', [cdata(things)])]), [things], { declaration: false, encode: encodeURIComponent });
            // paranoia, yes
            expect(decodeURIComponent(func('things'))).to.eql(expected);
            expect(func('things')).to.eql(encodeURIComponent(expected));
        });

        it('example', () => {
            const a = param('a');
            const tree =
            x('foo', [
                x('bar', { things: a }),
                x('bop', [ a ]),
                x('baz', [
                    x('stuff', [ a ]),
                    x('things', [ cdata('<', a, '>') ]),
                ]),
            ]);
            const func = compile(tree, [a]);
            console.log(func('stuff'));
            console.log(func('things'));
        });
    });
});
