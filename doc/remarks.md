## Perfomance Hints (For Implementers only)

* At `init` state creation of temporary objects is mostly avoided. Existing objects are modified or extended.
* The inner animation loop consisting of the sequence `model.pre().itr().post()` should run in the time frame of `1/60`th seconds - including user interaction - in order to achive real time behavior. Inside of that loop ...
    * Avoid creating temporary objects, as they must be removed by the garbage collector regularly. Don't rely on JIT compiler optimzing here. So avoid ... 
        * array methods returning arrays as `keys, map, values, ...`
        * `Object` or `Array` methods requiring a temporary function argument.
    * Do not use antiquated ES5 `forEach` loop in favor of much more performant ES6 `for...of` loop.
    * Try to keep array modifications at a minimum.
* Functional programming has its charm. But its paradigma to not modifying arguments but returning modified copies of them instead, does not fit very well with the performance requirements of the inner animation loop of a physics engine.

## Nodes

* Nodes are required to have a valid and unique `id` property of type string.
* Nodes must not have a mass value of `0`. Default mass is `1`. Unit is [kg].

## Loads

* Load elements should have a valid and in this case unique `id` property of type string.
* Load elements with `type` of `['force', 'spring']` are supported.

### Force

* Forces are acting on nodes exclusively. So they are required to have a valid reference `p` to a node.
* The force value `value` must be a positive number greater than zero interpreted as [`N`]. Default value is `1N`.
* Initial force orientation can be set by `w0` in [rad].
* Force orientation can be static or dynamic. In the dynamic case the orientation is referred to the orientation of a constraint specified by `wref` as a valid reference. `w0` is interpreted as an offset to the referenced constraint then.
* A drawing mode `mode` as one of `['push','pull']` specifies, how the force arrow is rendered. Default is `pull`.

### Spring

* Springs are acting between to nodes. So they are required to have two valid references `p1` and `p2` to these nodes.
* The spring rate `k` must be a positive number greater than zero interpreted as [`N/cm`]. Default value is `1 N/cm`.
* Initial spring length of the unloaded spring can be set by `len0`. If not specified, the initial distance between `p1` and `p2` is taken.

## Shapes

* Shape elements can be connected with nodes and/or constraints
* Shape elements may have a valid and in this case unique `id` property of type string.
* Shape elements with `type` of `['fix', 'flt', 'slider', 'bar', 'beam', 'wheel', 'poly', 'img']` are supported.

### Fix

* Fixed nodes (supports) are connected to a node, which is usually a base node.
* They need to have a valid reference `p` to their node.
* Fixed nodes have a fixed orientation specified by `w0` (default value `0`).

### Flt

* Floating nodes (supports) are connected to a node.
* They need to have a valid reference `p` to their node.
* Floating nodes have a fixed orientation specified by `w0` (default value `0`).

### Slider

* Slider shapes are connected to a node.
* They need to have a valid reference `p` to their node.
* Slider shapes have a fixed orientation specified by `w0` (default value `0`).
* Alternatively slider shapes can have an optional reference `wref` to a constraint for aligning their orientation to it. `w0` is interpreted as a constant relative angular difference then.

### Bar

* Bar shapes are defined between two nodes.
* They need to have valid references `p1` and `p2` to their nodes.

### Beam

* Beam shapes are connected to a node.
* They need to have a valid reference `p` to their node.
* Beam shapes have a constant length `len`.
* Beam shapes have a valid reference `wref` to a constraint for aligning their orientation to it.

### Wheel

* Wheel shapes are connected to a node.
* They need to have a valid reference `p` to their node.
* Wheel shapes have a valid reference `wref` to a constraint for aligning their orientation to it.
* Wheel shapes have a constant offset angle `w0` to their referenced constraint.
* Wheel shapes have a constant radius `r`.

### Poly

* Polygon shapes must have `pts` array containing at least two points in global coordinates.
* Polygon shapes are connected to a reference node.
* They need to have a valid reference `p` to their reference node.
* Polygon shapes have a fixed orientation specified by `w0` (default value `0`).
* Polygon shapes can have an optional reference `wref` to a constraint for aligning their orientation to it. `w0` is interpreted as a constant relative angular offset then.

### Img

* Image shapes must have a uniform resource locator string `uri` defined.
* Image shapes are connected to a reference node.
* They need to have a valid reference `p` to their reference node.
* Image shapes are connected with their lower left corner to their node (cartesian coordinate system assumed).
* A local offset to the lower left corner can be specified by `xoff` and `yoff`.
* Image shapes have a fixed orientation specified by `w0` (default value `0`).
* Image shapes can have an optional reference `wref` to a constraint for aligning their orientation to it. `w0` is interpreted as a constant relative angular offset then.
* Image shapes have a scaling factor specified by `scl` (default value `1`).

## Time and Display Refresh Rate

* Model time is globally controlled by `model.timer.t`.
* Time step `model.timer.dt` is globally constant `1/60` seconds.
* Refresh rate is graphics card/monitor related and controlled by browser's `requestAnimationFrame` cycles. This coincides mostly with the time step of about `1/60` seconds with current monitors.
* Driven constraints controlled by sliders (`input range`) or other input elements maintain their own local time.

## Input Driven Elementary Constraints

* Input driven elementary constraints (`input:true`) require to have drive properties defined also.
* The default drive type is `static` (`ft = ftt = 0`) in contrast to time driven elementary constraints, which have a default drive type of `linear` (`ft = 1; ftt = 0`).
* They provide a callback function `inputCallbk` which needs to be called with a single ...
    * angular parameter `w` in [deg] in case of type `ori` in the normalized range `[0..wmax]`
    * length parameter `r` in case of type `len` in the normalized range `[0..rmax]`
* Input driven elementary constraints (`input:true`) maintain their own local time in parallel to the global model time.
* Time step is irrelevant here, as the drive functions provide velocity and acceleration values at each time position.

## Logical Errors / Warnings

* Logical Errors or Warnings can occur, while initializing the model from its JSON based description.
* Errors interrupt the initialization process, while warnings don't.
* The controlling environment can test a successful initialization via `model.valid`, which is false in case of error. An Error or a possible warning can be accessed then by inspecting `model.msg` containing a message object.
* Message objects have a unique id `mid` and message specific additional properties.
* Messages are language neutral. The current language is `mec.lang` (default value `en`). They reside in a user language file `mec.msg.<lang>.js` and can be converted to a message string by calling `mec.messageString(msg)` with the message object as argument.
