# xyperscript

hyperscript for xml

```javascript
const a = param('a');
const func = compile(
    x('foo', [
        x('bar', { a: a }),
        x('bop', [ a ]),
        x('baz', [
            x('stuff', [a]),
            x('things', [a]),
        ]),
    ]),
    [a]);
console.log(func('stuff'));
//<?xml version="1.0" encoding="UTF-8"?>
//<foo>
//  <bar a="stuff"/>
//  <bop>stuff</bop>
//  <baz>
//    <stuff>stuff</stuff>
//    <things>stuff</things>
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