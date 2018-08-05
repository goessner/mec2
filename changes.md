# Final concept

Library `mec2.js` does not depend on other modules (except `g2.js`). It particularly does not depend on the DOM.

# public API

## model

```js
{
    id: String
    nodes: Array
    constraints: Array
    loads: Array
​    shapes: Array
​
    state: Object { valid: Boolean, direc: Number, … }
​    timer: Object { t: Number, dt: Number }

    dof: Number
    isActive: Boolean

    init()
    pose()
    reset()
    stop()
    tick(dt:Number)
    draw(g:Object)
}
```

## node

```js
{
    id: String
    base: Boolean
    m: Number
    x: Number
    xt: Number
    xtt: Number
    y: Number
    yt: Number
    ytt: Number

    Qx: Number
    Qy: Number
}
```
## constraint

```js
{
    id: String
    p1: Node
    p2: Node
    ori: Object
    len: Object
    r: Number
    rt: Number
    rtt: Number
    w: Number
    wt: Number
    wtt: Number

    type: String
    dof: Number
    force: Number
    moment: Number
}
```
## load

```js
{
    id: String
    type: String
}
```
depending on its `load.type` loads become one of these objects:

### load.force

```js
{
    id: String
    type: String

    p: Node
    value: Number
    wref: Constraint
    w0: Number
    mode: String

    Qx: Number
    Qy: Number
}
```

### load.spring

*- not yet implemented -*

## shape

```js
{
    type: String
}
```

depending on its `shape.type` shapes become one of these objects:

### shape.fix

```js
{
    type: String
    p: Node
    w0: Number
}
```

### shape.flt

```js
{
    type: String
    p: Node
    w0: Number
}
```

### shape.slider

```js
{
    type: String
    p: Node
    wref: Constraint
    w0: Number
}
```

### shape.bar

```js
{
    type: String
    p1: Node
    p2: Node
}
```
### shape.beam

```js
{
    type: String
    p: Node
    wref: Constraint
    len: Number
}
```
### shape.wheel

```js
{
    type: String
    p: Node
    wref: Constraint
    w0: Number
    r: Number
}
```
### shape.img

```js
{
    type: String
    uri: String
    p: Node
    wref: Constraint
    w0: Number
    xoff: Number
    yoff: Number
    scl: Number
}
```


# Changes 03/08/18

* Commenting the requirement for `app` to provide a `cartesian` getter (see `mec.microapp.js`)
* Rename `tickTimer`'s `tick` method to `timerTick` in `mixin.js` to avoid collision with `app`'s own new `tick` method (should have no other side effects).
* Rename `app.step` method to `app.tick` in `mec.microapp.js`.
* Adding `key` event handler to `mec.microapp.js` for using escape key or others for anything.
* Adding `state` to `app` to be compatible with Jan's (modifying `mec.microapp.js` when required). It has one of the values [`created`,`initialized`,`active`,`idle`, `input`].
* Triggering new `app.pause` method when pressing `Escape` key.
* Accepting `mec.model.gravity` values as *falsy*, not necessarily of type `boolean`.
* Throwing nodes by dragging, giving them an initial velocity, is deactivated at current. Has to be investigated further.
* When releasing the pointer after dragging, the node always has zero velocity.
* Implement `isSleeping` getter for `model` and `node` to indicate significant motion.
* Automatically change `app.state` from `active` to `idle` in `app.tick()`, if `model.isSleeping === true`.
* New `model.isActive` getter is testing, if there are any active drives in constraints or if some nodes are moving (see example `mec.5r.drive`)
* drives with different start times are working now (see example `mec.somecranks`)
* drives in constraints get additional boolean `bounce` property (see example `mec.crank`).
* drives in constraints get additional integer `repeat` property (see example `mec.crank`).

# Changes 04/08/18
* Adding a `static` type to drive functions, which is for velocity-less actuating positions.
* `model.dirty` flag isn't used anymore. It's flagged as `depricated`.

# Changes 05/08/18
* Rename `model.pos()` and `model.vel()` to `model.posStep()` and `model.velStep()`.
* Rename `constraint.pos()` and `constraint.vel()` to `constraint.posStep()` and `constraint.velStep()`.
* Change `constraint.type` from object member to getter.
* Eliminate ambiguity of `shape.bar` definition by defining `{type:'bar',p1,p2}` and new `shape.beam` by `{type:'beam',p,wref,len}`
* Split `mec.load` into `mec.load` and `mec.load.force`, to add other load types easier later.

