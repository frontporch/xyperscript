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
    children?: Array<string | Parameter | XTree | CData>
): XTree

export function x(
    name: string,
    children?: Array<string | Parameter | XTree | CData>
): XTree
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
