/**
 * mec.node (c) 2018-19 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.model.js
 * @requires g2.js
 */
"use strict";

/**
 * Wrapper class for extending plain node objects, usually coming from JSON strings.
 * @method
 * @returns {object} load object.
 * @param {object} - plain javascript load object.
 * @property {string} id - node id.
 * @property {number} x - x-coordinate.
 * @property {number} y - y-coordinate.
 * @property {number} [m=1] - mass.
 * @property {boolean} [base=false] - specify node as base node.
 */
mec.node = {
    extend(node) { Object.setPrototypeOf(node, this.prototype); node.constructor(); return node; },
    prototype: {
        constructor() { // always parameterless .. !
            this.x = this.x || 0;
            this.y = this.y || 0;
            this.x0 = this.x;
            this.y0 = this.y;
            this.xt = this.yt = 0;
            this.xtt = this.ytt = 0;
            this.dxt = this.dyt = 0;
            this.Qx = this.Qy = 0;     // sum of external loads ...
        },
        /**
         * Check node properties for validity.
         * @method
         * @param {number} idx - index in node array.
         * @returns {boolean | object} false - if no error was detected, error object otherwise.
         */
        validate(idx) {
            if (!this.id)
                return { mid: 'E_ELEM_ID_MISSING', elemtype: 'node', idx };
            if (this.model.elementById(this.id) !== this)
                return { mid: 'E_ELEM_ID_AMBIGIOUS', id: this.id };
            if (typeof this.m === 'number' && mec.isEps(this.m))
                return { mid: 'E_NODE_MASS_TOO_SMALL', id: this.id, m: this.m };
            return false;
        },
        /**
         * Initialize node. Multiple initialization allowed.
         * @method
         * @param {object} model - model parent.
         * @param {number} idx - index in node array.
         */
        init(model, idx) {
            this.model = model;
            if (!this.model.notifyValid(this.validate(idx))) return;

            // make inverse mass to first class citizen ...
            this.im = typeof this.m === 'number' ? 1 / this.m
                : this.base === true ? 0
                    : 1;
            // ... and mass / base to getter/setter
            Object.defineProperty(this, 'm', {
                get: () => 1 / this.im,
                set: (m) => this.im = 1 / m,
                enumerable: true, configurable: true
            });
            Object.defineProperty(this, 'base', {
                get: () => this.im === 0,
                set: (q) => this.im = q ? 0 : 1,
                enumerable: true, configurable: true
            });

            this.g2cache = false;
        },
        /**
         * Remove node, if there are no dependencies to other objects.
         * The calling app has to ensure, that `node` is in fact an entry of
         * the `model.nodes` array.
         * @method
         * @param {object} node - node to remove.
         * @returns {boolean} true, the node was removed, otherwise false in case of existing dependencies.
         */
        remove() {
            const elms = this.model.nodes;
            return this.model.hasDependents(this) ?
                false :
                !!elms.splice(elms.indexOf(this), 1);
        },
        /**
         * Delete node and all depending elements from model.
         * The calling app has to ensure, that `node` is in fact an entry of
         * the `model.nodes` array.
         * @method
         * @param {object} node - node to remove.
         */
        purge() {
            this.model.purgeElements(this.model.dependentsOf(this));
            return this.remove();
        },
        // kinematics
        // current velocity state .. only used during iteration.
        get xtcur() { return this.xt + this.dxt },
        get ytcur() { return this.yt + this.dyt },
        // inverse mass
        get type() { return 'node' }, // needed for ... what .. ?
        get dof() { return this.m === Number.POSITIVE_INFINITY ? 0 : 2 },
        /**
         * Test, if node is not resting
         * @const
         * @type {boolean}
         */
        get isSleeping() {
            return this.base
                || mec.isEps(this.xt, mec.velTol)
                && mec.isEps(this.yt, mec.velTol)
                && mec.isEps(this.xtt, mec.velTol / this.model.timer.dt)
                && mec.isEps(this.ytt, mec.velTol / this.model.timer.dt);
        },
        /**
         * Energy [kgu^2/s^2]
         */
        get energy() {
            var e = 0;
            if (!this.base) {
                if (this.model.hasGravity)
                    e += this.m * (-(this.x - this.x0) * mec.from_m(this.model.gravity.x) - (this.y - this.y0) * mec.from_m(this.model.gravity.y));
                e += 0.5 * this.m * (this.xt ** 2 + this.yt ** 2);
            }
            return e;
        },
        /**
         * Check node for dependencies on another element.
         * @method
         * @param {object} elem - element to test dependency for.
         * @returns {boolean} always false.
         */
        dependsOn(elem) { return false; },
        /**
         * Check node for deep (indirect) dependencies on another element.
         * @method
         * @param {object} elem - element to test dependency for.
         * @returns {boolean} dependency exists.
         */
        deepDependsOn(elem) {
            return elem === this;
        },
        reset() {
            if (!this.base) {
                this.x = this.x0;
                this.y = this.y0;
            }
            // resetting kinematic values ...
            this.xt = this.yt = 0;
            this.xtt = this.ytt = 0;
            this.dxt = this.dyt = 0;
        },

        /**
         * First step of node pre-processing.
         * Zeroing out node forces and differential velocities.
         * @method
         */
        pre_0() {
            this.Qx = this.Qy = 0;
            this.dxt = this.dyt = 0;
        },
        /**
         * Second step of node pre-processing.
         * @method
         * @param {number} dt - time increment [s].
         * @returns {boolean} dependency exists.
         */
        pre(dt) {
            // apply optional gravitational force
            if (!this.base && this.model.hasGravity) {
                this.Qx += this.m * mec.from_m(this.model.gravity.x);
                this.Qy += this.m * mec.from_m(this.model.gravity.y);
            }
            // semi-implicite Euler step ... !
            this.dxt += this.Qx * this.im * dt;
            this.dyt += this.Qy * this.im * dt;

            // increasing velocity is done dynamically and implicitly by using `xtcur, ytcur` during iteration ...

            // increase positions using previously incremented velocities ... !
            // x = x0 + (dx/dt)*dt + 1/2*(dv/dt)*dt^2
            this.x += (this.xt + 1.5 * this.dxt) * dt;
            this.y += (this.yt + 1.5 * this.dyt) * dt;
        },

        /**
         * Node post-processing.
         * @method
         * @param {number} dt - time increment [s].
         * @returns {boolean} dependency exists.
         */
        post(dt) {
            // update velocity from `xtcur, ytcur`
            this.xt += this.dxt;
            this.yt += this.dyt;
            // get accelerations from velocity differences...
            this.xtt = this.dxt / dt;
            this.ytt = this.dyt / dt;
        },
        asJSON() {
            return '{ "id":"' + this.id + '","x":' + this.x0 + ',"y":' + this.y0
                + (this.base ? ',"base":true' : '')
                + ((!this.base && this.m !== 1) ? ',"m":' + this.m : '')
                + (this.idloc ? ',"idloc":"' + this.idloc + '"' : '')
                + ' }';
        },

        // analysis getters
        get force() { return { x: this.Qx, y: this.Qy }; },
        get pos() { return { x: this.x, y: this.y }; },
        get vel() { return { x: this.xt, y: this.yt }; },
        get acc() { return { x: this.xtt, y: this.ytt }; },
        get forceAbs() { return Math.hypot(this.Qx, this.Qy); },
        get velAbs() { return Math.hypot(this.xt, this.yt); },
        get accAbs() { return Math.hypot(this.xtt, this.ytt); },

        // interaction
        get showInfo() {
            return this.state & g2.OVER;
        },
        get infos() {
            return {
                'id': () => `'${this.id}'`,
                'pos': () => `p=(${this.x.toFixed(0)},${this.y.toFixed(0)})`,
                'vel': () => `v=(${mec.to_m(this.xt).toFixed(2)},${mec.to_m(this.yt).toFixed(2)})m/s`,
                'm': () => `m=${this.m}`
            }
        },
        info(q) { const i = this.infos[q]; return i ? i() : '?'; },
        //        _info() { return `x:${this.x.toFixed(1)}<br>y:${this.y.toFixed(1)}` },
        hitInner({ x, y, eps }) {
            return g2.isPntInCir({ x, y }, this, eps);
        },
        selectBeg({ x, y, t }) { },
        selectEnd({ x, y, t }) {
            if (!this.base) {
                this.xt = this.yt = this.xtt = this.ytt = 0;
            }
        },
        drag({ x, y, mode }) {
            if (mode === 'edit' && !this.base) { this.x0 = x; this.y0 = y; }
            else { this.x = x; this.y = y; }
        },
        // graphics ...
        get isSolid() { return true },
        get sh() {
            return this.state & g2.OVER ? [0, 0, 10, this.model.env.show.hoveredElmColor]
                : this.state & g2.EDIT ? [0, 0, 10, this.model.env.show.selectedElmColor]
                    : false;
        },
        get r() { return mec.node.radius; },

        g2() {
            const g = g2().use({
                grp: this.base ? mec.node.g2BaseNode
                    : mec.node.g2Node, x: this.x, y: this.y, sh: this.sh
            });
            if (this.model.env.show.nodeLabels) {
                const loc = mec.node.locdir[this.idloc || 'n'];
                g.txt({
                    str: this.id || '?',
                    x: this.x + 3 * this.r * loc[0],
                    y: this.y + 3 * this.r * loc[1],
                    thal: 'center', tval: 'middle',
                    ls: this.model.env.show.txtColor
                });
            }
            return g;
        },
        draw(g) {
            if (this.model.env.show.nodes)
                g.ins(this);
        }
    },
    radius: 5,
    locdir: {
        e: [1, 0], ne: [Math.SQRT2 / 2, Math.SQRT2 / 2], n: [0, 1], nw: [-Math.SQRT2 / 2, Math.SQRT2 / 2],
        w: [-1, 0], sw: [-Math.SQRT2 / 2, -Math.SQRT2 / 2], s: [0, -1], se: [Math.SQRT2 / 2, -Math.SQRT2 / 2]
    },
    g2BaseNode: g2().cir({ x: 0, y: 0, r: 5, ls: "@nodcolor", fs: "@nodfill" })
        .p().m({ x: 0, y: 5 }).a({ dw: Math.PI / 2, x: -5, y: 0 }).l({ x: 5, y: 0 })
        .a({ dw: -Math.PI / 2, x: 0, y: -5 }).z().fill({ fs: "@nodcolor" }),
    g2Node: g2().cir({ x: 0, y: 0, r: 5, ls: "@nodcolor", fs: "@nodfill" })
}

mec.model.prototype.addPlugIn('nodes', mec.node);