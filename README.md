# xyperscript

hyperscript for xml

```javascript
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
//<?xml version="1.0" encoding="UTF-8"?>
//<foo>
//  <bar things="stuff"/>
//  <bop>stuff</bop>
//  <baz>
//    <stuff>stuff</stuff>
//    <things><![CDATA[<stuff>]]></things>
//  </baz>
//</foo>

console.log(func('things'));
//<?xml version="1.0" encoding="UTF-8"?>
//<foo>
//  <bar things="things"/>
//  <bop>things</bop>
//  <baz>
//    <stuff>things</stuff>
//    <things><![CDATA[<things>]]></things>
//  </baz>
//</foo>
```

## XML Escaping

**There is none**


## Functions

### `x`

```typescript
export function x(
  name: string,
  attributes: {
    [name: string]:
      string |
      Parameter |
      Array<string | Parameter>
  },
  children: Array<string | Parameter | XTree | CData>
): XTree
```

The `x` function is the counterpart of the `h` function from [hyperscript](https://github.com/dominictarr/hyperscript). Only the first parameter is required.

```typescript
export function x(
  name: string,
  attributes: {
    [name: string]:
      string |
      Parameter |
      Array<string | Parameter>
  }
): XTree

export function x(
  name: string,
  children: Array<string | Parameter | XTree | CData>
): XTree

export function x(
  name: string
): XTree
```

The `x` function will ignore all "falsy" values except the empty string.

```javascript
compile(
  x('a', [
    x('b', [ '' ]),
    x('b', [ false ]),
    x('b', [ 0 ]),
    x('b', [ null ]),
    x('b', [ undefined ]),
    x('b', [ NaN ]),
  ]),
  [],
  { declaration: false })()
//<a>
//  <b></b>
//  <b/>
//  <b/>
//  <b/>
//  <b/>
//  <b/>
//</a>
```

### `param`

```typescript
export function param(
  name: string
): Parameter
```


### `compile`

```typescript
export function compile(
  tree: XTree,
  params: Array<Parameter>,
  opts?: {
    declaration?: boolean,
    indent?: number,
  }
): Function
```

### `cdata`

```typescript
export function cdata(
  ...params: Array<string | Parameter>
): CData
```

## LICENSE

MIT
