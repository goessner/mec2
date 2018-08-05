/**
 * mec (c) 2018 Stefan Goessner
 * @license MIT License
 */
"use strict";

/**
 * @namespace mec namespace for the mec library.
 * It includes mainly constants and some general purpose functions.
 */
const mec = {
/**
 * mec library version
 * @const
 * @type {string}
 */
VERSION: "0.70",
/**
 * Reference to the global context. In browsers this will be 'window'.
 */
global: this,
/**
 * minimal float difference to 1.0
 * @const
 * @type {number}
 */
EPS: 1.19209e-07,
/**
 * Linear tolerance for position correction.
 * @const
 * @type {number}
 */
linTol: 0.001,
/**
 * Angular tolerance for orientation correction.
 * @const
 * @type {number}
 */
angTol: 2 / 180 * Math.PI,
/**
 * Velocity tolerance.
 * @const
 * @type {number}
 */
velTol: 0.01,
/**
 * Force tolerance.
 * @const
 * @type {number}
 */
forceTol: 0.1,
/**
 * Moment tolerance.
 * @const
 * @type {number}
 */
momentTol: 0.01,
/**
 * Maximal value for position correction.
 * @const
 * @type {number}
 */
maxLinCorrect: 20,
/**
 * fixed limit of assembly iteration steps.
 */
asmItrMax: 512,
/**
 * itrMax: fixed limit of simulation iteration steps.
 */
itrMax: 256,
/**
 * corrMax: fixed number of position correction steps.
 */
corrMax: 64,
/**
 * calculation target ['velocity'|'forces'], used for stopping iteration loop.
 */
priority: 'velocity',
/* graphics related */
/**
 * place and show labels with elements
 */
showNodeLabels: false,
showConstraintLabels: true,
showLoadLabels: true,
/**
 * color for drawing valid constraints.
 */
validConstraintColor: '#777',
/**
 * color for drawing invalid constraints.
 */
invalidConstraintColor: '#b11',
/**
 * color for drawing forces.
 */
forceColor: 'orange',

/**
 * unit specifiers and relations
 */
/**
 * default length scale factor (meter per unit) [m/u].
 * @const
 * @type {number}
 */
m_u: 0.01,
/**
 * convert [u] => [m]
 * @return {number} Value in [m]
 */
to_m(x) { return x*mec.m_u; },
/**
 * convert [m] = [u]
 * @return {number} Value in [u]
 */
from_m(x) { return x/mec.m_u; },
/**
 * convert [kgu/m^2] => [kgm/s^2] = [N]
 * @return {number} Value in [N]
 */
to_N(x) { return x*mec.m_u; },
/**
 * convert [N] = [kgm/s^2] => [kgu/s^2]
 * @return {number} Value in [kgu/s^2]
 */
from_N(x) { return x/mec.m_u; },
/**
 * convert [kgu^2/m^2] => [kgm^2/s^2] = [Nm]
 * @return {number} Value in [Nm]
 */
to_Nm(x) { return x*mec.m_u*mec.m_u; },
/**
 * convert [Nm] = [kgm^2/s^2] => [kgu^2/s^2]
 * @return {number} Value in [kgu^2/s^2]
 */
from_Nm(x) { return x/mec.m_u/mec.m_u; },
/**
 * convert [kgu/m^2] => [kgm^2/s^2] = [J]
 * @return {number} Value in [N]
 */
to_J(x) { return mec.to_Nm(x) },
/**
 * convert [J] = [kgm^2/s^2] => [kgu^2/s^2]
 * @return {number} Value in [kgu^2/s^2]
 */
from_J(x)  { return mec.from_Nm(x) },
/**
 * convert [kgu^2] => [kgm^2]
 * @return {number} Value in [kgm^2]
 */
to_kgm2(x) { return x*mec.m_u*mec.m_u; },
/**
 * convert [kgm^2] => [kgu^2]
 * @return {number} Value in [kgu^2]
 */
from_kgm(x) { return x/mec.m_u/mec.m_u; },

/**
 * Helper functions
 */
/**
 * Test, if the absolute value of a number `a` is smaller than eps.
 * @param {number} a Value to test.
 * @param {number} [eps=mec.EPS]  used epsilon.
 * @returns {boolean} test result.
 */
isEps(a,eps) {
    return a < (eps || mec.EPS) && a > -(eps || mec.EPS);
 },
/**
 * Clamps a numerical value within the provided bounds.
 * @param {number} val Value to clamp.
 * @param {number} lo Lower bound.
 * @param {number} hi Upper bound.
 * @returns {number} Value within the bounds.
 */
clamp(val,lo,hi) { return Math.min(Math.max(val, lo), hi); },
/**
 * Convert angle from degrees to radians.
 * @param {number} deg Angle in degrees.
 * @returns {number} Angle in radians.
 */
toRad(deg) { return deg*Math.PI/180; },
/**
 * Convert angle from radians to degrees.
 * @param {number} rad Angle in radians.
 * @returns {number} Angle in degrees.
 */
toDeg(rad) { return rad/Math.PI*180; },
/**
 * Mixin a set of prototypes into a primary object.
 * @param {object} obj Primary object.
 * @param {objects} ...protos Set of prototype objects.
 */
mixin(obj, ...protos) {
    protos.forEach(proto => {
        obj = Object.defineProperties(obj, Object.getOwnPropertyDescriptors(proto))
    })
    return obj;
}
};
/**
 * mec.node (c) 2018 Stefan Goessner
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
            this.x0 = this.x;
            this.y0 = this.y;
            this.xt = this.yt = 0;
            this.xtt = this.ytt = 0;
            this.dxt = this.dyt = 0;
            this.Qx = this.Qy = 0;     // sum of external loads ...
        },
        init(model) {
            this.model = model;
            // make inverse mass to first class citizen ... 
            this.im = typeof this.m === 'number' ? 1/this.m 
                    : this.m === 'infinite'      ? 0         // deprecated  !!
                    : this.base === true         ? 0
                    : 1;
            // ... and mass / base to getter/setter
            Object.defineProperty(this,'m',{ get: () => 1/this.im,
                                             set: (m) => this.im = 1/m,
                                             enumerable:true, configurable:true });
            Object.defineProperty(this,'base',{ get: () => this.im === 0,
                                                set: (q) => this.im = q ? 0 : 1,
                                                enumerable:true, configurable:true });
        },
        // kinematics
        // current velocity state .. only used during iteration.
        get xtcur() { return this.xt + this.dxt },
        get ytcur() { return this.yt + this.dyt },
        // inverse mass
//        get im() { return 1/this.m },
        get dof() { return this.m === Number.POSITIVE_INFINITY ? 0 : 2 },
        /**
         * Test, if node is significantly moving 
         * @const
         * @type {boolean}
         */
        get isSleeping() {
            return this.base
                || mec.isEps(this.xt,mec.velTol)
                && mec.isEps(this.yt,mec.velTol);
        },
        /**
         * Energy [kgu^2/s^2]
         */
        get energy() {
            var e = 0;
            if (!this.base) {
                if (this.model.hasGravity) 
                    e += this.m*(-this.x*this.model.gravity.x - this.y*this.model.gravity.y);
                e += 0.5*this.m*(this.xt**2 + this.yt**2);
            }
            return e;
        },
        reset() {
            this.x = this.x0;
            this.y = this.y0;
            this.xt = this.yt = 0;
            this.xtt = this.ytt = 0;
            this.dxt = this.dyt = 0;
        },
        pre(dt) {
            // symplectic euler ... partially
            this.x += this.model.direc*this.xt*dt;
            this.y += this.model.direc*this.yt*dt;
/*
            if (this.usrDrag) {  // node throwing by user occured .. !
                const xt = this.usrDrag.dx / this.usrDrag.dt*1000,
                      yt = this.usrDrag.dy / this.usrDrag.dt*1000,
                      v  = Math.hypot(xt,yt);
                if (v > 20) {    // set upper limit of throwing velocity
                    this.xt = xt/v*Math.min(v,250);
                    this.yt = yt/v*Math.min(v,250);
                }
                else   // set model to rest ..
                    this.model.stop();

                delete this.usrDrag;  // avoid multiple evaluation .. !
            }
*/
            // zero out velocity differences .. important !!
            this.dxt = this.dyt = 0;

            // if applied forces are acting, set velocity diffs initially by forces.
            if (this.Qx || this.Qy) {
                this.dxt = this.Qx*this.im * dt;
                this.dyt = this.Qy*this.im * dt;
            }
        },
        post(dt) {
            // symplectic euler ... partially
            this.xt += this.dxt;
            this.yt += this.dyt;
            // get accelerations from velocity differences...
            this.xtt = this.dxt/dt;
            this.ytt = this.dyt/dt;
        },
        // interaction
        get isSolid() { return true },
        get sh() { return this.state & g2.OVER ? [0,0,5,"black"] : false },
        hitInner({x,y,eps}) {
            return g2.isPntInCir({x,y},this,eps);
        },
        selectBeg({x,y,t}) {
//            if (!this.base)
//                this.usrDrag = {dx:this.x,dy:this.y,dt:t};
        },
        selectEnd({x,y,t}) {
            if (!this.base) {
                this.xt = this.yt = this.xtt = this.ytt = 0;
//                this.usrDrag.dx = this.x - this.usrDrag.dx;
//                this.usrDrag.dy = this.y - this.usrDrag.dy;
//                this.usrDrag.dt = (t - this.usrDrag.dt);
            }
        },
        drag({x,y}) {
            this.x = x; this.y = y;
        },
        // graphics ...
        get r() { return mec.node.radius; },
        g2() {
            const loc = mec.node.locdir[this.idloc || 'n'],
                  xid = this.x + 3*this.r*loc[0], 
                  yid = this.y + 3*this.r*loc[1],
                  g = this.base 
                    ? g2().beg({x:()=>this.x,y:()=>this.y,sh:()=>this.sh})
                          .cir({x:0,y:0,r:5,ls:"@nodcolor",fs:"@nodfill"})
                          .p().m({x:0,y:5}).a({dw:Math.PI/2,x:-5,y:0}).l({x:5,y:0})
                          .a({dw:-Math.PI/2,x:0,y:-5}).z().fill({fs:"@nodcolor"})
                          .end()
                    : g2().cir({x:()=>this.x,y:()=>this.y,r:this.r,
                                ls:'#333',fs:'#eee',sh:()=>this.sh});
            if (mec.showNodeLabels)
                g.txt({str:this.id||'?',x:xid,y:yid,thal:'center',tval:'middle'});
            return g;
        }
    },
    radius: 5,
    locdir: { e:[ 1,0],ne:[ Math.SQRT2/2, Math.SQRT2/2],n:[0, 1],nw:[-Math.SQRT2/2, Math.SQRT2/2],
              w:[-1,0],sw:[-Math.SQRT2/2,-Math.SQRT2/2],s:[0,-1],se:[ Math.SQRT2/2,-Math.SQRT2/2] }
}
/**
 * mec.constraint (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.node.js
 * @requires mec.drive.js
 * @requires mec.model.js
 * @requires g2.js
 */
"use strict";

//  { id:<string>,p1:<string>,p2:<string>,ori:<object>,len:<object> },
/**
 * Wrapper class for extending plain constraint objects, usually coming from JSON objects.
 * @method
 * @returns {object} constraint object.
 * @param {object} - plain javascript constraint object.
 * @property {string} id - constraint id.
 * @property {string} p1 - first point id.
 * @property {string} p2 - second point id.
 * @property {object} [ori] - orientation object.
 * @property {string} [ori.type] - type of orientation constraint ['free'|'const'|'ref'|'drive'].
 * @property {number} [ori.w0] - initial angle [rad].
 * @property {string} [ori.ref] - referenced constraint id.
 * @property {string} [ori.refval] - referencing other orientation or length value ['ori'|'len'].
 * @property {number} [ori.ratio] - ratio to referencing value.
 * @property {string} [ori.func] - drive function name from `mec.drive` object ['linear'|'quadratic', ...].
 *                                 If the name points to a function in `mec.drive` (not an object as usual) 
 *                                 it will be called with `ori.arg` as an argument.
 * @property {string} [ori.arg] - drive function argument.
 * @property {number} [ori.t0] - drive parameter start value.
 * @property {number} [ori.Dt] - drive parameter value range.
 * @property {number} [ori.Dw] - drive angular range [rad].
 * @property {object} [len] - length object.
 * @property {string} [len.type] - type of length constraint ['free'|'const'|'ref'|'drive'].
 * @property {number} [len.r0] - initial length.
 * @property {string} [len.ref] - referenced constraint id.
 * @property {string} [len.refval] - referencing other orientation or length value ['ori'|'len'].
 * @property {number} [ori.ratio] - ratio to referencing value.
 * @property {string} [len.func] - drive function name ['linear'|'quadratic', ...].
 * @property {string} [len.arg] - drive function argument.
 * @property {number} [len.t0] - drive parameter start value.
 * @property {number} [len.Dt] - drive parameter value range.
 * @property {number} [len.Dr] - drive linear range [rad].
 */
mec.constraint = {
    extend(c) { Object.setPrototypeOf(c, this.prototype); c.constructor(); return c; },
    prototype: {
        constructor() {}, // always parameterless .. !
        init(model) {
            this.model = model;
            if (typeof this.p1 === 'string')
                this.p1 = this.model.nodeById(this.p1);
            if (typeof this.p2 === 'string')
                this.p2 = this.model.nodeById(this.p2);
            if (!this.hasOwnProperty('ori'))
                this.ori = { type:'free' };
            if (!this.hasOwnProperty('len'))
                this.len = { type:'free' };

            const ori = this.ori, len = this.len;

            if      (ori.type === 'free')  this.init_ori_free(ori);
            else if (ori.type === 'const') this.init_ori_const(ori);
            else if (ori.type === 'ref')   this.init_ori_ref(ori);
            else if (ori.type === 'drive') this.init_ori_drive(ori);

            if      (len.type === 'free')  this.init_len_free(len);
            else if (len.type === 'const') this.init_len_const(len);
            else if (len.type === 'ref')   this.init_len_ref(len);
            else if (len.type === 'drive') this.init_len_drive(len);

            this.type = ori.type === 'free' && len.type === 'free' ? 'free'
                      : ori.type === 'free' && len.type !== 'free' ? 'rot'
                      : ori.type !== 'free' && len.type === 'free' ? 'tran'
                      : ori.type !== 'free' && len.type !== 'free' ? 'ctrl'
                      : 'invalid';

            // lagrange identifiers
            this.lambda_r = this.dlambda_r = 0;
            this.lambda_w = this.dlambda_w = 0;
        },
        /**
         * Reset constraint
         */
        reset() {
            this.lambda_r = this.dlambda_r = 0;
            this.lambda_w = this.dlambda_w = 0;
        },
        get initialized() { return typeof this.p1 === 'object' },
        get dof() {
            return (this.ori.type === 'free' ? 1 : 0) + (this.len.type === 'free' ? 1 : 0);
        },
        /**
         * Force value in [N]
         */
        get force() { 
            return mec.to_N(-this.lambda_r);
        },
        /**
         * Moment value in [Nm]
         */
        get moment() { return mec.to_Nm(-this.lambda_w * this.r); },
        /**
         * Check constraint for dependencies on another element.
         * @method
         * @param {object} elem - element to test dependency for.
         * @returns {boolean} true, dependency exists.
         */
        dependsOn(elem) {
            return this.p1 === elem
                || this.p2 === elem 
                || this.ori && this.ori.ref === elem
                || this.len && this.len.ref === elem;
        },
        // privates
        get ax() { return this.p2.x - this.p1.x },
        get ay() { return this.p2.y - this.p1.y },
        get axt() { return this.p2.xtcur - this.p1.xtcur },
        get ayt() { return this.p2.ytcur - this.p1.ytcur },
        get axtt() { return this.p2.xtt - this.p1.xtt },
        get aytt() { return this.p2.ytt - this.p1.ytt },
        get mc1() { return this.p1.im / (this.p1.im + this.p2.im) },
        get mc2() { return this.p2.im / (this.p1.im + this.p2.im) },
        get color() { return this.model.valid 
                           ? mec.validConstraintColor 
                           : mec.invalidConstraintColor; 
        },
        init_ori_free(ori) {
            this.w0 = Math.atan2(this.ay,this.ax);
            this.assignGetters({
                w:  () => Math.atan2(this.ay,this.ax),
                wt: () => (this.ax*this.ayt - this.ay*this.axt)/this.r**2,
                wtt:() => (this.ax*this.aytt - this.ay*this.axtt)/this.r**2
            });
        },
        init_ori_const(ori) {
            this.w = this.w0 = ori.hasOwnProperty('w0') ? ori.w0 : Math.atan2(this.ay,this.ax);
            this.wt = this.wtt = 0;
        },
        init_ori_ref(ori) {
            this.w0 = Math.atan2(this.ay,this.ax);
            ori.ratio = ori.ratio || 1;
            if (typeof ori.ref === 'string')
                ori.ref = this.model.constraintById(ori.ref);
            if (!ori.ref.initialized) 
                ori.ref.init(this.model);
            if (ori.refValue === 'len')
                this.assignGetters({
                    w:  () => this.w0 + ori.ratio*(ori.ref.r - ori.ref.r0),
                    wt: () => ori.ratio*ori.ref.rt,
                    wtt:() => ori.ratio*ori.ref.rtt
                })
            else
                this.assignGetters({
                    w:  () => this.w0 + ori.ratio*(ori.ref.w - ori.ref.w0),
                    wt: () => ori.ratio*ori.ref.wt,
                    wtt:() => ori.ratio*ori.ref.wtt
                })
        },
        init_ori_drive(ori) {
            this.w0 = ori.hasOwnProperty('w0') ? ori.w0 : Math.atan2(this.ay,this.ax);

            ori.drive = mec.drive[ori.func || 'linear'];
            ori.Dw = ori.Dw || 2*Math.PI;
            ori.t0 = ori.t0 || 0;
            ori.Dt = ori.Dt || 1;
            if (ori.bounce) {
                ori.drive = mec.drive.bounce(ori.drive);
                ori.Dt *= 2;  // preserve duration per repetition
            }
            if (ori.repeat) {
                ori.drive = mec.drive.repeat(ori.drive,ori.repeat);
                ori.Dt *= ori.repeat;  // preserve duration per repetition
            }
/* needed for parametric drive functions (ramp) .. some time in future
            ori.drive = typeof mec.drive[ori.func] === 'function' 
                      ? mec.drive[ori.func].apply(null,ori.args)
                      : mec.drive[ori.func];
*/
            if (ori.input) {    // requesting for input element .. for handing over 'inputCallbk'
                ori.input_t = 0;
                ori.inputCallbk = (e) => {    // assuming user friendly angles in [deg] are coming in.
                    const t =  (+e.target.value)*Math.PI/180*ori.Dt/ori.Dw;
                    ori.prev_t = ori.input_t;
                    ori.input_t = t;
                    this.model.timer.dt = Math.PI/180*ori.Dt/ori.Dw;  // dt depends on slider tick size ..
                    this.model.direc = Math.sign(ori.input_t - ori.prev_t) || 1;  // no zero value allowed ..
                }
            }
            // Access drive time via input element (slider) or as model time ...
            Object.defineProperty(ori, 't', { get: () => ori.input ? ori.input_t : this.model.timer.t, 
                                              enumerable:true, 
                                              configurable:true }
            );

            this.assignGetters({
                w:  () => this.w0 + ori.drive.f(Math.max(0,Math.min((ori.t - ori.t0)/ori.Dt,1)))*ori.Dw,
                wt: () => this.model.timer.t < ori.t0 || this.model.timer.t > ori.t0 + ori.Dt
                        ? 0
                        : ori.drive.fd(Math.max(0,Math.min((ori.t - ori.t0)/ori.Dt,1)))*ori.Dw/ori.Dt,
                wtt:() => this.model.timer.t < ori.t0 || this.model.timer.t > ori.t0 + ori.Dt
                        ? 0
                        : ori.drive.fdd(Math.max(0,Math.min((ori.t - ori.t0)/ori.Dt,1)))*ori.Dw/(ori.Dt**2)
            })
        },
        init_len_free(len) {
            this.r0 = Math.hypot(this.ay,this.ax);
            this.assignGetters({
                r:  () => Math.hypot(this.ay,this.ax),
                rt: () => (this.ax*this.axt + this.ay*this.ayt)/Math.hypot(this.ay,this.ax),
                rtt:() => (this.ax*this.axtt + this.ay*this.aytt + this.axt**2 + this.ayt**2 - this.rt**2)/Math.hypot(this.ay,this.ax)
            })
        },
        init_len_const(len) {
            this.r = this.r0 = len.hasOwnProperty('r0') ? len.r0 : Math.hypot(this.ay,this.ax);
            this.rt = this.rtt = 0;
        },
        init_len_ref(len) {
            this.r0 = Math.hypot(this.ay,this.ax);
            len.ratio = len.ratio || 1;
            if (typeof len.ref === 'string')
                len.ref = this.model.constraintById(len.ref);
            if (!len.ref.initialized) 
                len.ref.init(this.model);
            if (len.refValue === 'ori')
                this.assignGetters({
                    r:  () => this.r0 + len.ratio*(len.ref.w - len.ref.w0),
                    rt: () => len.ratio*len.ref.wt,
                    rtt:() => len.ratio*len.ref.wtt
                })
            else
                this.assignGetters({
                    r:  () => this.r0 + len.ratio*(len.ref.r - len.ref.r0),
                    rt: () => len.ratio*len.ref.rt,
                    rtt:() => len.ratio*len.ref.rtt
                })
        },
        init_len_drive(len) {
            this.r0 = len.hasOwnProperty('r0') ? len.r0 : Math.hypot(this.ay,this.ax);

            len.drive = mec.drive[len.func || 'linear'];
            len.Dr = len.Dr || 100;
            len.t0 = len.t0 || 0;
            len.Dt = len.Dt || 1;
            if (len.bounce) {
                len.drive = mec.drive.bounce(len.drive);
                len.Dt *= 2;  // preserve duration per repetition
            }
            if (len.repeat) {
                len.drive = mec.drive.repeat(len.drive,len.repeat);
                len.Dt *= len.repeat;  // preserve duration per repetition
            }
/* needed for parametric drive functions (ramp) .. some time in future
            len.drive = typeof mec.drive[len.func] === 'function' 
                      ? mec.drive[len.func].apply(null,len.args)
                      : mec.drive[len.func];
*/
            if (len.input) {    // requesting for input element .. for handing over 'inputCallbk'
                len.input_t = 0;
                len.inputCallbk = (e) => {    // assuming user friendly length values [u] coming in.
                    const dt = len.Dt/len.Dr,
                          t =  (+e.target.value)*dt;
                    len.prev_t = len.input_t;
                    len.input_t = t;
                    this.model.timer.dt = dt;  // dt depends on slider tick size ..
                    this.model.direc = Math.sign(len.input_t - len.prev_t) || 1;  // no zero value allowed ..
                }
            }
            // Access drive time via input element (slider) or as model time ...
            Object.defineProperty(len, 't', { get: () => len.input ? len.input_t : this.model.timer.t, 
                                              enumerable:true, 
                                              configurable:true }
            );

            this.assignGetters({
                r:  () => this.r0 + len.drive.f(Math.max(0,Math.min((len.t - len.t0)/len.Dt,1)))*len.Dr,
                rt: () => this.model.timer.t < len.t0 || this.model.timer.t > len.t0 + len.Dt
                        ? 0
                        : len.drive.fd(Math.max(0,Math.min((len.t - len.t0)/len.Dt,1)))*len.Dr/len.Dt,
                rtt:() => this.model.timer.t < len.t0 || this.model.timer.t > len.t0 + len.Dt
                        ? 0
                        : len.drive.fdd(Math.max(0,Math.min((len.t - len.t0)/len.Dt,1)))*len.Dw/(len.Dt**2)
            })
        },
        posStep() {
            let res;
            return this.type === 'free' ? true
                 : this.type === 'rot'  ? this.len_pos()
                 : this.type === 'tran' ? this.ori_pos()
                 : this.type === 'ctrl' ? (res = this.ori_pos(), (this.len_pos() && res))                    
                 : false;
        },
        velStep(dt) {
//            console.log(dt)
            return this.type === 'free' ? true
                 : this.type === 'rot'  ? this.len_vel(dt)
                 : this.type === 'tran' ? this.ori_vel(dt)
                 : this.type === 'ctrl' ? !!((+this.ori_vel(dt))*(+this.len_vel(dt)))
//                 : this.type === 'ctrl' ? (res = this.ori_vel(dt), (this.len_vel(dt) && res))
                 : false;
        },
        pre(dt) {
            const impulse_r = this.lambda_r * dt,
                  impulse_w = this.lambda_w * dt,
                  w = this.w, cw = Math.cos(w), sw = Math.sin(w);
            // apply radial impulse
            this.p1.dxt += -cw * this.p1.im * impulse_r;
            this.p1.dyt += -sw * this.p1.im * impulse_r;
            this.p2.dxt +=  cw * this.p2.im * impulse_r;
            this.p2.dyt +=  sw * this.p2.im * impulse_r;
            // apply angular impulse
            this.p1.dxt +=  sw * this.p1.im * impulse_w;
            this.p1.dyt += -cw * this.p1.im * impulse_w;
            this.p2.dxt += -sw * this.p2.im * impulse_w;
            this.p2.dyt +=  cw * this.p2.im * impulse_w;

            this.dlambda_r = this.dlambda_w = 0; // important !!
        },
        post(dt) {
            this.lambda_r += this.dlambda_r;
            this.lambda_w += this.dlambda_w;
            if (this.ori.type === 'ref') { // surprise .. that way it works ..
                this.ori.ref.lambda_w -= this.ori.ratio*this.dlambda_w;
            }
        },
        get ori_C() { 
            const w = this.w, r = this.r;
            return { x: this.ax - r*Math.cos(w),
                     y: this.ay - r*Math.sin(w) };
        },
        get ori_Ct() {
            const w = this.w, wt = this.wt, cw = Math.cos(w), sw = Math.sin(w), 
                  r = this.r, rt = this.rt;
            return { x: this.axt - rt*cw + r*wt*sw,
                     y: this.ayt - rt*sw - r*wt*cw };
        }, 
        get ori_mc() { return 1/(this.p1.im + this.p2.im); },
        ori_pos() {
            const C = this.ori_C,
                  factor = Math.max(Math.abs(C.x)/mec.maxLinCorrect,
                                    Math.abs(C.y)/mec.maxLinCorrect,1),
                  mc = this.ori_mc,
                  impulse = { x: -mc * (C.x /= factor), 
                              y: -mc * (C.y /= factor) };
//console.log(C)
            this.p1.x += -this.p1.im * impulse.x;
            this.p1.y += -this.p1.im * impulse.y;
            this.p2.x +=  this.p2.im * impulse.x;
            this.p2.y +=  this.p2.im * impulse.y;

            return mec.isEps(C.x, mec.linTol) 
                && mec.isEps(C.y, mec.linTol); // position constraint satisfied .. !
        },
        ori_vel(dt) {
            const Ct = this.ori_Ct, mc = this.ori_mc,
                  impulse = { x: -mc * Ct.x, y: -mc * Ct.y };

            this.p1.dxt += -this.p1.im * impulse.x;
            this.p1.dyt += -this.p1.im * impulse.y;
            this.p2.dxt +=  this.p2.im * impulse.x;
            this.p2.dyt +=  this.p2.im * impulse.y;

            this.dlambda_r += ( impulse.x * this.ax + impulse.y * this.ay)/this.r/dt;
            this.dlambda_w += (-impulse.x * this.ay + impulse.y * this.ax)/this.r/dt;

            return mec.isEps(Ct.x*dt, mec.linTol)
                && mec.isEps(Ct.y*dt, mec.linTol);   // velocity constraint satisfied .. !
        },
        get len_C() { return (this.ax**2 + this.ay**2 - this.r**2)/(2*this.r0); },
        get len_Ct() { return (this.ax*this.axt + this.ay*this.ayt - this.r*this.rt)/this.r0; },
        get len_mc() { return this.r0**2/((this.p1.im + this.p2.im)*(this.ax**2 + this.ay**2)); },
        len_pos() {
            const C = mec.clamp(this.len_C,-mec.maxLinCorrect,mec.maxLinCorrect), 
                  impulse = -this.len_mc * C;

            this.p1.x += -this.ax/this.r0 * this.p1.im * impulse;
            this.p1.y += -this.ay/this.r0 * this.p1.im * impulse;
            this.p2.x +=  this.ax/this.r0 * this.p2.im * impulse;
            this.p2.y +=  this.ay/this.r0 * this.p2.im * impulse;

            return mec.isEps(C, mec.linTol); // position constraint satisfied .. !
        },
        len_vel(dt) {
            const Ct = this.len_Ct, impulse = -this.len_mc * Ct;

            this.p1.dxt += -this.ax/this.r0 * this.p1.im * impulse;
            this.p1.dyt += -this.ay/this.r0 * this.p1.im * impulse;
            this.p2.dxt +=  this.ax/this.r0 * this.p2.im * impulse;
            this.p2.dyt +=  this.ay/this.r0 * this.p2.im * impulse;

            this.dlambda_r += impulse / dt;

            return mec.isEps(Ct*dt, mec.linTol); // velocity constraint satisfied .. !
        },
        assignGetters(getters) {
            for (const key in getters) 
                Object.defineProperty(this, key, { get: getters[key], enumerable:true, configurable:true });
        },
        // interaction
        get isSolid() { return false },
        get sh() { return this.state & g2.OVER ? [0,0,4,"gray"] : false },
        hitContour({x,y,eps}) {
            const p1 = this.p1, p2 = this.p2,
                  dx = this.p2.x - this.p1.x, dy = this.p2.y - this.p1.y,
                  off = 2*mec.node.radius/Math.hypot(dy,dx);
            return g2.isPntOnLin({x,y},{x:p1.x+off*dx,y:p1.y+off*dy},
                                       {x:p2.x-off*dx,y:p2.y-off*dy},eps);
        },
        // drawing
        g2() {
            const {p1,p2,w,r,type,ls,ls2,lw,id,idloc} = this,
                  g = g2().beg({x:p1.x,y:p1.y,w,scl:1,lw:2,
                                ls:'green',fs:'@ls',lc:'round',sh:()=>this.sh})
                            .stroke({d:`M50,0 ${r},0`,ls:()=>this.color,
                                     lw:lw+1,lsh:true})
                            .drw({d:mec.constraint.arrow[type],lsh:true})
                          .end();

            if (mec.showConstraintLabels) {
                let idstr = id || '?', cw = Math.cos(w), sw = Math.sin(w),
                      xid = p1.x + 20*cw - 10*sw, 
                      yid = p1.y + 20*sw + 10*cw;
                if (this.ori.type === 'ref') {
                    idstr += '('+ this.ori.ref.id+')';
                    xid -= 3*sw;
                    yid += 3*cw;
                }                    
                g.txt({str:idstr,x:xid,y:yid,thal:'center',tval:'middle'})
            }

            return g;
        }
    },
    arrow: {
        'ctrl': 'M0,0 35,0M45,0 36,-3 37,0 36,3 Z',
        'rot': 'M12,0 8,6 12,0 8,-6Z M0,0 8,0M15,0 35,0M45,0 36,-3 37,0 36,3 Z',
        'tran': 'M0,0 12,0M16,0 18,0M22,0 24,0 M28,0 35,0M45,0 36,-3 37,0 36,3 Z',
        'free': 'M12,0 8,6 12,0 8,-6ZM0,0 8,0M15,0 18,0M22,0 24,0 M28,0 35,0M45,0 36,-3 37,0 36,3 Z'
    }
}
/**
 * mec.drive (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 */
"use strict";

/**
 * @namespace mec.drive namespace for drive types of the mec library.
 * They are named and implemented after VDI 2145 and web easing functions.
 */
mec.drive = {
    linear: {
        f: (q) =>q, fd: (q) => 1, fdd: (q) => 0
    },
    quadratic: {
        f: (q) =>  q <= 0.5 ? 2*q*q : -2*q*q + 4*q - 1,
        fd: (q) =>  q <= 0.5 ? 4*q : -4*q + 4,
        fdd: (q) =>  q <= 0.5 ? 4 : -4
    },
    harmonic: { 
        f:   (q) => (1 - Math.cos(Math.PI*q))/2,
        fd:  (q) => Math.PI/2*Math.sin(Math.PI*q),
        fdd: (q) => Math.PI*Math.PI/2*Math.cos(Math.PI*q) 
    },
    sinoid: { 
        f:   (q) => q - Math.sin(2*Math.PI*q)/2/Math.PI,
        fd:  (q) => 1 - Math.cos(2*Math.PI*q),
        fdd: (q) =>     Math.sin(2*Math.PI*q)*2*Math.PI 
    },
    poly5: {
        f: (q) => (10 - 15*q + 6*q*q)*q*q*q,
        fd: (q) => (30 - 60*q +30*q*q)*q*q,
        fdd: (q) => (60 - 180*q + 120*q*q)*q
    },
    static: {   // used for actuators (Stellantrieb) without velocities and accelerations
        f: (q) =>q, fd: (q) => 0, fdd: (q) => 0
    },
    ramp(dq) {
        dq = mec.clamp(dq,0,0.5);
        if (dq === 0)
            return mec.drive.linear;
        else if (dq === 0.5)
            return mec.drive.quadratic;
        else {
            const a =  1/((1-dq)*dq);
            return {f: function(q) {
                        return (q < dq)   ? 1/2*a*q*q
                                : (q < 1-dq) ? a*(q - 1/2*dq)*dq
                                :              a*(1 - 3/2*dq)*dq + a*(q+dq-1)*dq - 1/2*a*(q+dq-1)*(q+dq-1);
                    },
                    fd: function(q) {
                        return (q < dq)   ? a*q
                            : (q < 1-dq) ? a*dq
                            :              a*dq - a*(q+dq-1);
                    },
                    fdd: function(q) {
                        return (q < dq)   ? a
                            : (q < 1-dq) ? 0
                            :             -a;
                    }
            };
        }
    },
    bounce: function(drv) {
        if (typeof drv === 'string') drv = mec.drive[drv];
        return {
            f: q => drv.f(q < 0.5 ? 2*q : 2-2*q),
            fd: q => drv.fd(q < 0.5 ? 2*q : 2-2*q),
            fdd: q => drv.fdd(q < 0.5 ? 2*q : 2-2*q)
        }
    },
    repeat: function(drv,n) {
        if (typeof drv === 'string') drv = mec.drive[drv];
        return {
            f: q => drv.f((q*n)%1),
            fd: q => drv.fd((q*n)%1),
            fdd: q => drv.fdd((q*n)%1)
        }
    },
    // Penner's' simple potential functions ... why are they so popular ?
    pot : [ { f: q => 1,         fd: q => 0,          fdd: q => 0 },
            { f: q => q,         fd: q => 1,          fdd: q => 0 },
            { f: q => q*q,       fd: q => 2*q,        fdd: q => 2 },
            { f: q => q*q*q,     fd: q => 3*q*q,      fdd: q => 6*q },
            { f: q => q*q*q*q,   fd: q => 4*q*q*q,    fdd: q => 12*q*q },
            { f: q => q*q*q*q*q, fd: q => 5*q*q*q*q,  fdd: q => 20*q*q*q } ],

    inPot(n) { return this.pot[n]; },

    outPot(n) { 
        const fn = this.pot[n];
        return { f:   q => 1 - fn.f(1-q), 
                 fd:  q =>    fn.fd(1-q), 
                 fdd: q =>  -fn.fdd(1-q) } 
    },
    
    inOutPot(n) { 
        const fn = this.pot[n], exp2 = Math.pow(2,n-1);
        return { f:   q => q < 0.5 ? exp2*fn.f(q)         : 1 - exp2*fn.f(1-q), 
                 fd:  q => q < 0.5 ? exp2*fn.fd(q)        :  exp2*fn.fd(1-q), 
                 fdd: q => q < 0.5 ? exp2*(n-1)*fn.fdd(q) : -exp2*(n-1)*fn.fdd(1-q) } 
    },
    
    get inQuad() { return this.inPot(2); },
    get outQuad() { return this.outPot(2); },
    get inOutQuad() { return this.inOutPot(2); },
    get inCubic() { return this.inPot(3); },
    get outCubic() { return this.outPot(3); },
    get inOutCubic() { return this.inOutPot(3); },
    get inQuart() { return this.inPot(4); },
    get outQuart() { return this.outPot(4); },
    get inOutQuart() { return this.inOutPot(4); },
    get inQuint() { return this.inPot(5); },
    get outQuint() { return this.outPot(5); },
    get inOutQuint() { return this.inOutPot(5); }
}
/**
 * mec.load (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.node.js
 * @requires mec.constraint.js
 * @requires mec.model.js
 * @requires g2.js
 */
"use strict";

/**
 * Wrapper class for extending plain load objects, usually coming from JSON objects.
 * @method
 * @returns {object} load object.
 * @param {object} - plain javascript load object.
 * @property {string} id - load id.
 * @property {string} [type='force'] - load type ['force'|'spring].
 * @property {string} p - node id, the force is acting upon.
 * @property {string} [wref] - constraint id, the force orientation is referring to.
 * @property {number} [value=1] - Force value in [N]
 * @property {number} [w0=0] - initial / offset orientation of force vector.
 * @property {number} [mode='pull'] - drawing mode of force arrow ['push'|'pull'] with regard to node.
 */
mec.load = {
    extend(load) { 
        Object.setPrototypeOf(load, this.prototype); 
        load.constructor(); 
        return load; 
    },
    prototype: {
        constructor() {}, // always parameterless .. !
        init(model) {
            this.model = model;
            if (!this.type) this.type = 'force';
            if (this.type === 'force') this.init_force(model);
        },
        init_force(model) {
            if (typeof this.p === 'string')
                this.p = model.nodeById(this.p);
            if (typeof this.wref === 'string')
                this.wref = model.constraintById(this.wref);
            this.value = mec.from_N(this.value || 1);
            this.w0 = typeof this.w0 === 'number' ? this.w0 : 0;
        },
        /**
         * Check load for dependencies on another element.
         * @method
         * @param {object} elem - element to test dependency for.
         * @returns {boolean} true, dependency exists.
         */
        dependsOn(elem) {
            return this.p === elem || this.wref === elem;
        },

        // cartesian components
        get w() { return this.wref ? this.wref.w + this.w0 : this.w0; },
        get Qx() { return this.value*Math.cos(this.w)},
        get Qy() { return this.value*Math.sin(this.w)},
        reset() {},
        apply() {
            if (this.type === 'force' && !this.p.base) {
                this.p.Qx += mec.from_N(this.Qx);
                this.p.Qy += mec.from_N(this.Qy);
            }
        },
        // interaction
        get isSolid() { return false },
        get sh() { return this.state & g2.OVER ? [0,0,4,"gray"] : false },
        hitContour({x,y,eps}) {
            const len = 45,   // const length for all force arrows
                  p = this.p,
                  cw = Math.cos(this.w), sw = Math.sin(this.w),
                  off = 2*mec.node.radius;
            return g2.isPntOnLin({x,y},{x:p.x+off*cw, y:p.y+off*sw},
                                       {x:p.x+(len+off)*cw,y:p.y+(len+off)*sw},eps);
        },
        g2() {
            if (this.type === 'force') {
                const w = this.w,
                      cw = Math.cos(w), sw = Math.sin(w),
                      p = this.p,
                      len = mec.load.forceLength,
                      off = 2*mec.node.radius,
                      idsign = this.mode === 'push' ? -1 : 1,
                      xid = p.x + idsign*25*cw - 12*sw, 
                      yid = p.y + idsign*25*sw + 12*cw,
                      x = this.mode === 'push' ? () => p.x - (len+off)*cw
                                               : () => p.x + off*cw,
                      y = this.mode === 'push' ? () => p.y - (len+off)*sw
                                               : () => p.y + off*sw,
                      g = g2().beg({x,y,w,scl:1,lw:2,ls:mec.forceColor,
                                    lc:'round',sh:()=>this.sh,fs:'@ls'})
                              .drw({d:mec.load.forceArrow,lsh:true})
                              .end();
                if (mec.showLoadLabels)
                    g.txt({str:this.id||'?',x:xid,y:yid,thal:'center',tval:'middle'});
                return g;
            }
        }
    },
    forceLength: 45,   // draw all forces of length ...
    forceArrow: 'M0,0 35,0M45,0 36,-3 37,0 36,3 Z'
}
/**
 * mec.shape (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.node.js
 * @requires mec.constraint.js
 * @requires mec.model.js
 * @requires g2.js
 */
"use strict";

//  { type:<string>},
/**
 * @method
 * @param {object} - plain javascript shape object.
 * @property {string} type - shape type ['fix'|'flt'|'slider'|'bar'|'wheel'|'img'].
 */
mec.shape = {
    extend(shape) {
        if (shape.type && mec.shape[shape.type]) {
            Object.setPrototypeOf(shape, Object.assign({},this.prototype,mec.shape[shape.type]));
            shape.constructor();
        }
        return shape; 
    },
    prototype: {
        constructor() {}, // always parameterless .. !
        dependsOn(elem) { return false; }
    }
}

/**
 * @param {object} - fixed node shape.
 * @property {string} p - referenced node id for position.
 * @property {number} w0 - initial angle.
 */
mec.shape.fix = {
    init(model) {
        if (typeof this.p === 'string')
            this.p = model.nodeById(this.p);
    },
    dependsOn(elem) {
        return this.p === elem;
    },
    draw(g) {
        g.use({grp:'nodfix',x:()=>this.p.x,y:()=>this.p.y,w:this.w0 || 0});
    }
}

/**
 * @param {object} - floating node shape.
 * @property {string} p - referenced node id for position.
 * @property {number} w0 - initial angle.
 */
mec.shape.flt = {
    init(model) {
        if (typeof this.p === 'string')
            this.p = model.nodeById(this.p);
    },
    dependsOn(elem) {
        return this.p === elem;
    },
    draw(g) {
        g.use({grp:'nodflt',x:()=>this.p.x,y:()=>this.p.y,w:this.w0 || 0});
    }
}

/**
 * @param {object} - slider shape.
 * @property {string} p - referenced node id for position.
 * @property {string} [wref] - referenced constraint id for orientation.
 * @property {number} w0 - initial angle / -difference.
 */
mec.shape.slider = {
    init(model) {
        if (typeof this.p === 'string')
            this.p = model.nodeById(this.p);
        if (typeof this.wref === 'string')
            this.wref = model.constraintById(this.wref);
    },
    /**
     * Check shape for dependencies on another element.
     * @method
     * @param {object} elem - element to test dependency for.
     * @returns {boolean} true, dependency exists.
     */
    dependsOn(elem) {
        return this.p === elem || this.wref === elem;
    },
    draw(g) {
        const w = this.wref ? ()=>this.wref.w : this.w0 || 0;
        g.beg({x:()=>this.p.x,y:()=>this.p.y,w})
           .rec({x:-16,y:-10,b:32,h:20,ls:"@nodcolor",fs:"@linkfill",lw:1,lj:"round"})
         .end()
    }
}

/**
 * @param {object} - bar shape.
 * @property {string} [p1] - referenced node id for start point position, and ...
 * @property {string} [p2] - referenced node id for end point position, or ...
 * @property {string} [p] - referenced node id for point position, and ...
 * @property {string} [wref] - referenced constraint id for orientation and ...
 * @property {number} [len] - bar length
 */
mec.shape.bar = {
    init(model) {
        if (typeof this.p === 'string' && typeof this.wref === 'string' && this.len > 0) {
            this.p = model.nodeById(this.p);
            this.wref = model.constraintById(this.wref);
        }
        else if (typeof this.p1 === 'string' && typeof this.p2 === 'string') {
            this.p1 = model.nodeById(this.p1);
            this.p2 = model.nodeById(this.p2);
        }
    },
    dependsOn(elem) {
        return this.p === elem || this.p1 === elem || this.p2 === elem || this.wref === elem;
    },
    draw(g) {
        const x1 = this.p1 ? () => this.p1.x : () => this.p.x,
              y1 = this.p1 ? () => this.p1.y : () => this.p.y,
              x2 = this.p2 ? () => this.p2.x 
                 : this.wref && this.len ? () => this.p.x + this.len*Math.cos(this.wref.w)
                 : this.p1.x,
              y2 = this.p2 ? () => this.p2.y 
                 : this.wref && this.len ? () => this.p.y + this.len*Math.sin(this.wref.w)
                 : this.p1.y;
        g.lin({x1,y1,x2,y2,ls:"@nodcolor",lw:8,lc:"round"})
         .lin({x1,y1,x2,y2,ls:"@nodfill2",lw:5.5,lc:"round"})
         .lin({x1,y1,x2,y2,ls:"@nodfill",lw:3,lc:"round"})
    }
}

/**
 * @param {object} - wheel shape.
 * @property {string} [p] - referenced node id for center point position, and ...
 * @property {string} [wref] - referenced constraint id for orientation and ...
 * @property {number} [w0] - start / offset angle [rad].
 * @property {number} [r] - radius
 */
mec.shape.wheel = {
    init(model) {
        if (typeof this.p === 'string')
            this.p = model.nodeById(this.p);
        if (typeof this.wref === 'string')
            this.wref = model.constraintById(this.wref);
    },
    dependsOn(elem) {
        return this.p === elem || this.wref === elem;
    },
    draw(g) {
        const w = this.wref ? ()=>this.wref.w : this.w0 || 0, r = this.r, 
              sgamma = Math.sin(2*Math.PI/3), cgamma = Math.cos(2*Math.PI/3);
        g.beg({x:()=>this.p.x,y:()=>this.p.y,w})
            .lin({x1:0,y1:0,x2:r-4,y2:0,ls:"@nodcolor",lw:8,lc:"round"})
            .lin({x1:0,y1:0,x2:r-4,y2:0,ls:"@nodfill2",lw:5.5,lc:"round"})
            .lin({x1:0,y1:0,x2:r-4,y2:0,ls:"@nodfill",lw:3,lc:"round"})

            .lin({x1:0,y1:0,x2:(r-4)*cgamma,y2:(r-4)*sgamma,ls:"@nodcolor",lw:8,lc:"round"})
            .lin({x1:0,y1:0,x2:(r-4)*cgamma,y2:(r-4)*sgamma,ls:"@nodfill2",lw:5.5,lc:"round"})
            .lin({x1:0,y1:0,x2:(r-4)*cgamma,y2:(r-4)*sgamma,ls:"@nodfill",lw:3,lc:"round"})

            .lin({x1:0,y1:0,x2:(r-4)*cgamma,y2:-(r-4)*sgamma,ls:"@nodcolor",lw:8,lc:"round"})
            .lin({x1:0,y1:0,x2:(r-4)*cgamma,y2:-(r-4)*sgamma,ls:"@nodfill2",lw:5.5,lc:"round"})
            .lin({x1:0,y1:0,x2:(r-4)*cgamma,y2:-(r-4)*sgamma,ls:"@nodfill",lw:3,lc:"round"})

            .cir({x:0,y:0,r:r-2.5,ls:"#e6e6e6",fs:"transparent",lw:5})
            .cir({x:0,y:0,r,ls:"@nodcolor",fs:"transparent",lw:1})
            .cir({x:0,y:0,r:r-5,ls:"@nodcolor",fs:"transparent",lw:1})
         .end()
    }
}

/**
 * @param {object} - image shape.
 * @property {string} [uri] - image uri
 * @property {string} [p] - referenced node id for center point position.
 * @property {string} [wref] - referenced constraint id for orientation.
 * @property {number} [w0] - start / offset angle [rad].
 * @property {number} [xoff] - x offset value.
 * @property {number} [yoff] - y offset value.
 * @property {number} [scl] - scaling factor.
 */
mec.shape.img = {
    init(model) {
        if (typeof this.p === 'string')
            this.p = model.nodeById(this.p);
        if (typeof this.wref === 'string')
            this.wref = model.constraintById(this.wref);
    },
    dependsOn(elem) {
        return this.p === elem || this.wref === elem;
    },
    draw(g) {
        const w0 = this.w0 || 0, w = this.wref ? ()=>this.wref.w + w0 : w0; 
        g.img({uri:this.uri,x:()=>this.p.x,y:()=>this.p.y,w,scl:this.scl,xoff:this.xoff,yoff:this.yoff})
    }
}
