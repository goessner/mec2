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
* `model.dirty` flag isn't used anymore.


