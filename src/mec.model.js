/**
 * mec.model (c) 2018-19 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.node.js
 * @requires mec.constraint.js
 */
"use strict";

/**
 * Wrapper class for extending plain model objects, usually generated from a JSON object.
 * @method
 * @returns {object} model object.
 * @param {object} - plain javascript model object.
 * @property {string} id - model id.
 * @property {boolean|object} [gravity] - Vector `{x,y}` of gravity or `{x:0,y:-10}` in case of `true`.
 * @property {object} [labels] - user specification of labels to show `default={nodes:false,constraints:true,loads:true}`.
 */
mec.model = {
    extend(model, env = mec) {
        Object.setPrototypeOf(model, this.prototype);
        model.constructor(env);
        return model;
    },
    prototype: {
        constructor(env) {
            this.env = env; // reference environment of model
            if (env !== mec && !env.show) // it's possible that user defined a (complete!) custom show object
                this.env.show = Object.create(Object.getPrototypeOf(mec.show), Object.getOwnPropertyDescriptors(mec.show)); // copy show object including getters

            this.showInfo = { nodes:this.env.show.nodeInfo, constraints:this.env.show.constraintInfo, loads:false };
            this.state = { valid:true,itrpos:0,itrvel:0,preview:false };
            this.timer = { t:0,dt:1/60,sleepMin:1 };
            // create empty containers for all elements
            for (const key of Object.keys(this.modules)) {
                if (!this[key]) {
                    this[key] = [];
                }
            }
            this.forAllModules((elm, module) => {
                module.extend(elm); }
            );
        },
        /**
         * Init model
         * @method
         * @returns object} model.
         */
        init() {
            if (this.gravity === true)
                this.gravity = Object.assign({},mec.gravity,{active:true});
            else if (!this.gravity)
                this.gravity = Object.assign({},mec.gravity,{active:false});
         // else ... gravity might be given by user as vector !

            if (!this.tolerance) this.tolerance = 'medium';

            this.state.valid = true;  // clear previous logical error result ...

            for (const key of Object.keys(this.modules)) {
                for (let idx = 0; idx < this[key].length; ++idx) {
                    this[key][idx].init(this, idx);
                }
            }

            return this;
        },
        modules: {},
        addModule(name, module) {
            // TODO define interface
            // if (!module ||
            //     !module.extend ||
            //     !module.init ||
            //     !module.reset
            //     // !module.byId
            //     // !module.dependsOn not sure if this is a hard requirement...
            //     ) {
            //     console.warn('TODO');
            //     return;
            // }
            this.modules[name] = module;
        },

        forAllModules(fn) {
            for (const [key, module] of Object.entries(this.modules)) {
                for (const elm of this[key]) {
                    fn(elm, module);
                }
            }
        },
        /**
         * Notification of validity by child. Error message aborts init procedure.
         * @method
         * @param {boolean | object} msg - message object or false in case of no error / warning.
         * @returns {boolean | object} message object in case of logical error / warning or `false`.
         */
        notifyValid(msg) {
            if (msg) {
                this.state.msg = msg;
                return (this.state.valid = msg.mid[0] !== 'E');
            }
            return true;
        },
        /**
         * Reset model
         * All nodes are set to their initial position.
         * Kinematic values are set to zero.
         * @method
         * @returns {object} model
         */
        reset() {
            this.timer.t = 0;
            this.timer.sleepMin = 1;
            Object.assign(this.state,{valid:true,itrpos:0,itrvel:0});
            this.forAllModules((elm) => elm.reset && elm.reset());
            return this;
        },
        /**
         * Preview model
         * Some views need pre calculation for getting immediate results (i.e. traces)
         * After `preview` was called, model is in `reset` state.
         * @method
         * @returns {object} model
         */
        preview() {
            let previewMode = false, tmax = 0;
            for (const view of this.views) {
                if (view.mode === 'preview') {
                    tmax = view.t0 + view.Dt;
                    view.reset(previewMode = true);
                }
            }
            if (previewMode) {
                this.reset();
                this.state.preview = true;
                this.timer.dt = 1/30;

                for (this.timer.t = 0; this.timer.t <= tmax; this.timer.t += this.timer.dt) {
                    this.pre().itr().post();
                    for (const view of this.views)
                        if (view.preview)
                            view.preview();
                }

                this.timer.dt = 1/60;
                this.state.preview = false;
                this.reset();
            }
            return this;
        },
        /**
         * Assemble model (depricated ... use pose() instead)
         * @method
         * @returns {object} model
         */
        asm() {
            let valid = this.asmPos();
            valid = this.asmVel() && valid;
            return this;
        },
        /**
         * Bring mechanism to a valid pose.
         * No velocities or forces are calculated.
         * @method
         * @returns {object} model
         */
        pose() {
            return this.asmPos();
        },
        /**
         * Perform timer tick.
         * Model time is incremented by `dt`.
         * Model time is independent of system time.
         * Input elements may set simulation time and `dt` explicite. Depricated, they maintain their local time in parallel !
         * `model.tick()` is then called with `dt = 0`.
         * @method
         * @param {number} [dt=0] - time increment.
         * @returns {object} model
         */
        tick(dt) {
            // fix: ignore dt for now, take it as a constant (study variable time step theoretically) !!
            this.timer.t += (this.timer.dt = 1/60);
            this.pre().itr().post();
            return this;
        },
        /**
         * Stop model motion.
         * Zero out velocities and accelerations.
         * @method
         * @returns {object} model
         */
        stop() {
            // post process nodes
            for (const node of this.nodes)
                node.xt = node.yt = node.xtt = node.ytt = 0;
            return this;
        },
        /**
         * Model degree of freedom (movability)
         */
        get dof() {
            let dof = 0;
            if (!this.nodes || !this.constraints) {
                console.warn('TODO');
            }
            for (const node of this.nodes) {
                dof += node.dof;
            }
            for (const constraint of this.constraints) {
                dof -= (2 - constraint.dof);
            }
            return dof;
        },
        /**
         * Gravity (vector) value.
         * @type {boolean}
         */
        get hasGravity() { return this.gravity.active; },

        get valid() { return this.state.valid; },
        set valid(q) { this.state.valid = q; },
        /**
         * Message object resulting from initialization process.
         * @type {object}
         */
        get msg() { return this.state.msg; },
        get info() {
            if (this.showInfo.nodes)
                for (const node of this.nodes)
                    if (node.showInfo)
                        return node.info(this.showInfo.nodes);
            if (this.showInfo.constraints)
                for (const constraint of this.constraints)
                    if (constraint.showInfo)
                        return constraint.info(this.showInfo.constraints);
        },
/*
        get info() {
            let str = '';
            for (const view of this.views)
                if (view.hasInfo)
                    str += view.infoString()+'<br>';
            return str.length === 0 ? false : str;
        },
*/
        /**
         * Number of positional iterations.
         * @type {number}
         */
        get itrpos() { return this.state.itrpos; },
        set itrpos(q) { this.state.itrpos = q; },
        /**
         * Number of velocity iterations.
         * @type {number}
         */
        get itrvel() { return this.state.itrvel; },
        set itrvel(q) { this.state.itrvel = q; },
        /**
         * Set offset to current time, when testing nodes for sleeping state shall begin.
         * @type {number}
         */
        set sleepMinDelta(dt) { this.timer.sleepMin = this.timer.t + dt; },
        /**
         * Test, if none of the nodes are moving (velocity = 0).
         * @type {boolean}
         */
        get isSleeping() {
            let sleeping = this.timer.t > this.timer.sleepMin;  // chance for sleeping exists ...
            if (sleeping)
                for (const node of this.nodes)
                    sleeping = sleeping && node.isSleeping;
            return sleeping;
        },
        /**
         * Number of active drives
         * @const
         * @type {int}
         */
        get activeDriveCount() {
            let activeCnt = 0;
            for (const constraint of this.constraints)
                activeCnt += constraint.activeDriveCount(this.timer.t);
            return activeCnt;
        },
        /**
         * Some drives are active
         * deprecated: Use `activeDriveCount` instead.
         * @const
         * @type {boolean}
         */
        get hasActiveDrives() { return this.activeDriveCount > 0; },
        /**
         * Array of objects referencing constraints owning at least one input controlled drive.
         * The array objects are structured like so: 
         * { constraint: <constraint reference>,
         *   sub: <string of `['ori', 'len']`
         * }
         * If no input controlled drives exist, an empty array is returned.
         * @const
         * @type {array} Array holding objects of type {constraint, sub};
         */
        get inputControlledDrives() {
            const inputs = [];
            for (const constraint of this.constraints) {
                if (constraint.ori.type === 'drive' && constraint.ori.input)
                    inputs.push({constraint:constraint,sub:'ori'})
                if (constraint.len.type === 'drive' && constraint.len.input)
                    inputs.push({constraint:constraint,sub:'len'})
            }
            return inputs;
        },
        /**
         * Test, if model is active.
         * Nodes are moving (nonzero velocities) or active drives exist.
         * @type {boolean}
         */
        get isActive() {
            return this.activeDriveCount > 0   // active drives
                || this.dof > 0           // or can move by itself
                && !this.isSleeping;      // and does exactly that
        },
        /**
         * Energy [kgu^2/s^2]
         */
        get energy() {
            var e = 0;
            for (const node of this.nodes)
                e += node.energy;
            for (const load of this.loads)
                e += load.energy;
            return e;
        },
        /**
         * center of gravity 
         */
        get cog() {
            var center = {x:0,y:0}, m = 0;
            for (const node of this.nodes) {
                if (!node.base) {
                    center.x += node.x*node.m;
                    center.y += node.y*node.m;
                    m += node.m;
                }
            }
            center.x /= m;
            center.y /= m;
            return center;
        },

        /**
         * Check, if other elements are dependent on specified element.
         * @method
         * @param {object} elem - element.
         * @returns {boolean} true in case of existing dependents.
         */
        hasDependents(elem) {
            // TODO why return the last occurence? Why not stop at the first? 
            let dependency = false;
            this.forAllModules(() => dependency = elm.dependency.dependsOn(elem) || dependency)
            return dependency;
        },
        /**
         * Get direct dependents of a specified element.
         * As a result a dictionary object containing dependent elements is created:
         * `{constraints:[], loads:[], shapes:[], views:[]}`
         * @method
         * @param {object} elem - element.
         * @returns {object} dictionary object containing dependent elements.
         */
        dependentsOf(elem, deps) {
            deps = deps || {}

            this.forAllModules((elm, module) => {
                if (elm.dependsOn(elem)) {
                    this.dependentsOf(elm, deps);
                    deps[module].push(elm);
                }
            });
            return deps;
        },
        /**
         * Verify an element indirect (deep) depending on another element.
         * @method
         * @param {object} elem - element.
         * @returns {boolean} dependency exists.
         */
        /*
        deepDependsOn(elem,target) {
            if (elem === target)
                return true;
            else {
                for (const node of this.nodes)
                    if (elem.dependsOn(node))
                        return true;
                for (const constraint of this.constraints)
                    if (elem.dependsOn(elem) || this.deepDependsOn(elem,constraint))
                        return true;
                for (const load of this.loads)
                    if (load.dependsOn(elem))
                        deps.loads.push(load);
            for (const view of this.views)
                if (view.dependsOn(elem))
                    deps.views.push(view);
            for (const shape of this.shapes)
                if (shape.dependsOn(elem))
                    deps.shapes.push(shape);
                for 
            }
        },
*/
        /**
         * Purge all elements in an element dictionary.
         * @method
         * @param {object} elems - element dictionary.
         */
        purgeElements(elems) {
            this.forAllModules((elm, module) => {
                module.splice(module.indexOf(elm), 1);
            });
        },
        /**
         * Get element by id.
         * @method
         * @param {string} id - element id.
         */
        elementById(id) {
            // TODO These functions should be in their respective module.
            return this.nodeById(id)
                || this.constraintById(id)
                || this.loadById(id)
                || this.viewById(id)
                || id === 'model' && this;
        },
        /**
         * Add node to model.
         * @method
         * @param {object} node - node to add.
         */
        addNode(node) {
            this.nodes.push(node);
        },
        /**
         * Get node by id.
         * @method
         * @param {object} node - node to find.
         */
        nodeById(id) {
            for (const node of this.nodes)
                if (node.id === id)
                    return node;
            return false;
        },
        /**
         * Remove node, if there are no dependencies to other objects.
         * The calling app has to ensure, that `node` is in fact an entry of
         * the `model.nodes` array.
         * @method
         * @param {object} node - node to remove.
         * @returns {boolean} true, the node was removed, otherwise false in case of existing dependencies.
         */
        removeNode(node) {
            const dependency = this.hasDependents(node);
            if (!dependency)
                this.nodes.splice(this.nodes.indexOf(node),1);  // finally remove node from array.

            return !dependency;
        },
        /**
         * Delete node and all depending elements from model.
         * The calling app has to ensure, that `node` is in fact an entry of
         * the `model.nodes` array.
         * @method
         * @param {object} node - node to remove.
         */
        purgeNode(node) {
            this.purgeElements(this.dependentsOf(node));
            this.nodes.splice(this.nodes.indexOf(node),1);
        },
        /**
         * Add constraint to model.
         * @method
         * @param {object} constraint - constraint to add.
         */
        addConstraint(constraint) {
            this.constraints.push(constraint);
        },
        /**
         * Get constraint by id.
         * @method
         * @param {object} id - constraint id.
         * @returns {object} constraint to find.
         */
        constraintById(id) {
            for (const constraint of this.constraints)
                if (constraint.id === id)
                    return constraint;
            return false;
        },
        /**
         * Remove constraint, if there are no dependencies to other objects.
         * The calling app has to ensure, that `constraint` is in fact an entry of
         * the `model.constraints` array.
         * @method
         * @param {object} constraint - constraint to remove.
         * @returns {boolean} true, the constraint was removed, otherwise false in case of existing dependencies.
         */
        removeConstraint(constraint) {
            const dependency = this.hasDependents(constraint);
            if (!dependency)
                this.constraints.splice(this.constraints.indexOf(constraint),1);  // finally remove node from array.

            return !dependency;
        },
        /**
         * Delete constraint and all depending elements from model.
         * The calling app has to ensure, that `constraint` is in fact an entry of
         * the `model.constraints` array.
         * @method
         * @param {object} constraint - constraint to remove.
         */
        purgeConstraint(constraint) {
            this.purgeElements(this.dependentsOf(constraint));
            this.constraints.splice(this.constraints.indexOf(constraint),1);
        },
        /**
         * Add load to model.
         * @method
         * @param {object} load - load to add.
         */
        addLoad(load) {
            this.loads.push(load);
        },
        /**
         * Get load by id.
         * @method
         * @param {object} id - load id.
         * @returns {object} load to find.
         */
        loadById(id) {
            for (const load of this.loads)
                if (load.id === id)
                    return load;
            return false;
        },
        /**
         * Remove load, if there are no other objects depending on it.
         * The calling app has to ensure, that `load` is in fact an entry of
         * the `model.loads` array.
         * @method
         * @param {object} node - load to remove.
         * @returns {boolean} true, the node was removed, otherwise other objects depend on it.
         */
        removeLoad(load) {
            const dependency = this.hasDependents(load);
            if (!dependency)
                this.loads.splice(this.loads.indexOf(load),1);
            return !dependency;
        },
        /**
         * Delete load and all depending elements from model.
         * The calling app has to ensure, that `load` is in fact an entry of
         * the `model.loads` array.
         * @method
         * @param {object} load - load to delete.
         */
        purgeLoad(load) {
            this.purgeElements(this.dependentsOf(load));
            this.loads.splice(this.loads.indexOf(load),1);
        },
        /**
         * Add shape to model.
         * @method
         * @param {object} shape - shape to add.
         */
        addShape(shape) {
            this.shapes.push(shape);
        },
        /**
         * Remove shape, if there are no other objects depending on it.
         * The calling app has to ensure, that `shape` is in fact an entry of
         * the `model.shapes` array.
         * @method
         * @param {object} shape - shape to remove.
         */
        removeShape(shape) {
            const idx = this.shapes.indexOf(shape);
            if (idx >= 0)
                this.shapes.splice(idx,1);
        },
        /**
         * Delete shape and all dependent elements from model.
         * The calling app has to ensure, that `shape` is in fact an entry of
         * the `model.shapes` array.
         * @method
         * @param {object} shape - shape to delete.
         */
        purgeShape(shape) {
            this.purgeElements(this.dependentsOf(shape));
            this.shapes.splice(this.shapes.indexOf(shape),1);
        },
        /**
         * Add view to model.
         * @method
         * @param {object} view - view to add.
         */
        addView(view) {
            this.views.push(view);
        },
        /**
         * Get view by id.
         * @method
         * @param {object} id - view id.
         * @returns {object} view to find.
         */
        viewById(id) {
            for (const view of this.views)
                if (view.id === id)
                    return view;
            return false;
        },
        /**
         * Remove view, if there are no other objects depending on it.
         * The calling app has to ensure, that `view` is in fact an entry of
         * the `model.views` array.
         * @method
         * @param {object} view - view to remove.
         */
        removeView(view) {
            const idx = this.views.indexOf(view);
            if (idx >= 0)
                this.views.splice(idx,1);
        },
        /**
         * Delete view and all dependent elements from model.
         * The calling app has to ensure, that `view` is in fact an entry of
         * the `model.views` array.
         * @method
         * @param {object} view - view to delete.
         */
        purgeView(view) {
            this.purgeElements(this.dependentsOf(view));
            this.views.splice(this.views.indexOf(view),1);
        },
        /**
         * Return a JSON-string of the model
         * @method
         * @returns {string} model as JSON-string.
         */
        asJSON() {
            // dynamically create a JSON output string ...
            const nodeCnt = this.nodes.length;
            const contraintCnt = this.constraints.length;
            const loadCnt = this.loads.length;
            const shapeCnt = this.shapes.length;
            const viewCnt = this.views.length;
            const comma = (i,n) => i < n-1 ? ',' : '';
            const str = '{'
                      + '\n  "id":"'+this.id+'"'
                      + (this.title ? (',\n  "title":"'+this.title+'"') : '')
                      + (this.gravity.active ? ',\n  "gravity":true' : '')  // in case of true, should also look at vector components  .. !
                      + (nodeCnt ? ',\n  "nodes": [\n' : '\n')
                      + (nodeCnt ? this.nodes.map((n,i) => '    '+n.asJSON()+comma(i,nodeCnt)+'\n').join('') : '')
                      + (nodeCnt ? (contraintCnt || loadCnt || shapeCnt || viewCnt) ? '  ],\n' : '  ]\n' : '')
                      + (contraintCnt ? '  "constraints": [\n' : '')
                      + (contraintCnt ? this.constraints.map((n,i) => '    '+n.asJSON()+comma(i,contraintCnt)+'\n').join('') : '')
                      + (contraintCnt ? (loadCnt || shapeCnt || viewCnt) ? '  ],\n' : '  ]\n' : '')
                      + (loadCnt ? '  "loads": [\n' : '')
                      + (loadCnt ? this.loads.map((n,i) => '    '+n.asJSON()+comma(i,loadCnt)+'\n').join('') : '')
                      + (loadCnt ? (shapeCnt || viewCnt) ? '  ],\n' : '  ]\n' : '')
                      + (shapeCnt ? '  "shapes": [\n' : '')
                      + (shapeCnt ? this.shapes.map((n,i) => '    '+n.asJSON()+comma(i,shapeCnt)+'\n').join('') : '')
                      + (shapeCnt ? viewCnt ? '  ],\n' : '  ]\n' : '')
                      + (viewCnt ? '  "views": [\n' : '')
                      + (viewCnt ? this.views.map((n,i) => '    '+n.asJSON()+comma(i,viewCnt)+'\n').join('') : '')
                      + (viewCnt ? '  ]\n' : '')
                      + '}';

            return str;
        },
        /**
         * Apply loads to their nodes.
         * @internal
         * @method
         * @returns {object} model
         */
        applyLoads() {
            // Apply node weight in case of gravity.
            for (const node of this.nodes) {
                node.Qx = node.Qy = 0;
                if (!node.base && this.hasGravity) {
                    node.Qx = node.m*mec.from_m(this.gravity.x);
                    node.Qy = node.m*mec.from_m(this.gravity.y);
                }
            }
            // Apply external loads.
            for (const load of this.loads)
                load.apply();
            return this;
        },
        /**
         * Assemble positions of model.
         * @internal
         * @method
         * @returns {object} model
         */
        asmPos() {
            let valid = false;
            this.itrpos = 0;
            while (!valid && this.itrpos++ < mec.asmItrMax) {
                valid = this.posStep();
            }
            return this.valid = valid;
        },
        /**
         * Position iteration step over all constraints.
         * @internal
         * @method
         * @returns {object} model
         */
        posStep() {
            let valid = true;  // pre-assume valid constraints positions ...
            for (const constraint of this.constraints)
                valid = constraint.posStep() && valid;
            return valid;
        },
        /**
         * Assemble velocities of model.
         * @internal
         * @method
         * @returns {object} model
         */
        asmVel() {
            let valid = false;
            this.itrvel = 0;
            while (!valid && this.itrvel++ < mec.asmItrMax)
                valid = this.velStep();
            return this.valid = valid;
        },
        /**
         * Velocity iteration step over all constraints.
         * @method
         * @returns {object} model
         */
        velStep() {
            let valid = true;  // pre-assume valid constraints velocities ...
            for (const constraint of this.constraints) {
                valid = constraint.velStep(this.timer.dt) && valid;
            }
            return valid;
        },
        /**
         * Pre-process model.
         * @internal
         * @method
         * @returns {object} model
         */
        pre() {
            // Clear node loads and velocity differences.
            for (const node of this.nodes)
                node.pre_0();
            // Apply external loads.
            for (const load of this.loads)
                load.apply();
            // pre process nodes
            for (const node of this.nodes)
                node.pre(this.timer.dt);
            // pre process constraints
            for (const constraint of this.constraints)
                constraint.pre(this.timer.dt);
            // eliminate drift ...
            this.asmPos(this.timer.dt);
            // pre process views
            for (const view of this.views)
                if (view.pre)
                    view.pre(this.timer.dt);
            return this;
        },

        /**
         * Perform iteration steps until constraints are valid or max-iteration
         * steps for assembly are reached.
         * @internal
         * @method
         * @returns {object} model
         */
        itr() {
            if (this.valid)  // valid asmPos as prerequisite ...
                this.asmVel();
            return this;
        },
        /**
         * Post-process model.
         * @internal
         * @method
         * @returns {object} model
         */
        post() {
            // post process nodes
            for (const node of this.nodes)
                node.post(this.timer.dt);
            // post process constraints
            for (const constraint of this.constraints)
                constraint.post(this.timer.dt);
            // post process views
            for (const view of this.views)
                if (view.post)
                    view.post(this.timer.dt);

//    console.log('E:'+mec.to_J(this.energy))
            return this;
        },
        /**
         * Draw model.
         * @method
         * @param {object} g - g2 object.
         * @returns {object} model
         */
        draw(g) {
            this.forAllModules((elm) => elm.draw(g));
            return this;
        }
    }
}