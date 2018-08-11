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
    type: 'force'

    p: Node
    value: Number
    wref: Constraint
    w0: Number
    mode: String

    len: Number
    force: Number
    Qx: Number
    Qy: Number
}
```

### load.spring

```js
{
    id: String
    type: 'spring'

    p1: Node
    p2: Node
    k: Number
    len0: Constraint

    Qx: Number
    Qy: Number
}
```

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
    type: 'fix'
    p: Node
    w0: Number
}
```

### shape.flt

```js
{
    type: 'flt'
    p: Node
    w0: Number
}
```

### shape.slider

```js
{
    type: 'slider'
    p: Node
    wref: Constraint
    w0: Number
}
```

### shape.bar

```js
{
    type: 'bar'
    p1: Node
    p2: Node
}
```
### shape.beam

```js
{
    type: 'beam'
    p: Node
    wref: Constraint
    len: Number
}
```
### shape.wheel

```js
{
    type: 'wheel'
    p: Node
    wref: Constraint
    w0: Number
    r: Number
}
```
### shape.img

```js
{
    type: 'img'
    uri: String
    p: Node
    wref: Constraint
    w0: Number
    xoff: Number
    yoff: Number
    scl: Number
}
```

# Changes 11/08/18
* add `stroke` property to `mec.trace` elements.
* changed source to current `mec.labels` convention.
* introduce `mec.labels` structure with previous defaults for setting per JSON model.
* depricate `mec.showNodeLabels`, `mec.showConstraintLabels` , `mec.showLoadLabels`.
* decouple element prototype extension and initialization.
* static `mec.aly.*` for processing `view.info` added.
* `view.info` added.
* `model.elementById` added.

# Changes 10/08/18

* `trace` view added.
* apply internal constraint forces to its nodes.
* minor vector view bugs removed.
* Elements as well as the model itself now have a asJSON() method, which returns a formatted JSON string. toJSON() will probably be removed in the future.

# Changes 09/08/18

* view container added to model.
* vector view implemented.

# Changes 08/08/18

* Bug removed in `mec.model.isActive`. The negated result was returned. (Changes in app required !)
* Bug removed in `mec.model.hasActiveDrives`.


# Changes 07/08/18

* Add `mec.load.spring`.
* Remove hilite bug with `mec.load.force`.
* Add `mec.gravity = {x:0,y:-10,active:false}` as default gravity vector and mode to `mec.cor.js`. This is in order to switch gravity comfortable on and off, without affecting its vector.
* Added a toJSON method to model and to all element types. model.toJSON() invokes .toJSON() on each element in the model returns a canonical JSON-representation of the model
* Implemented a global darkmode flag (default false) for darker canvas backgrounds. Most colors are now centralized as getters in mec.core.
* Added a different shading for elements when they are selected and not just hovered over.

# Changes 06/08/18

* Rename `model.hasDependencies()` to the semantic more correct `model.hasDependents()`.
* Add `model.dependentsOf(elem)` to get a dictionary object of all dependents.
* Add `model.purgeElements(elems)` to purge all elements in a dictionary object.
* Add a new function `mec.toZero(a,eps)` to `mec.core.js`. If amount of `a` is smaller than `eps` 
the result is `0` else `a`.
* Avoid constraint masses to get *infinite*.

# Changes 05/08/18

* Rename `model.pos()` and `model.vel()` to `model.posStep()` and `model.velStep()`.
* Rename `constraint.pos()` and `constraint.vel()` to `constraint.posStep()` and `constraint.velStep()`.
* Change `constraint.type` from object member to getter.
* Eliminate ambiguity of `shape.bar` definition by defining `{type:'bar',p1,p2}` and new `shape.beam` by `{type:'beam',p,wref,len}`
* Split `mec.load` into `mec.load` and `mec.load.force`, to add other load types easier later.

# Changes 04/08/18

* Adding a `static` type to drive functions, which is for velocity-less actuating positions.
* `model.dirty` flag isn't used anymore. It's flagged as `depricated`.

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
