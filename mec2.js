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
/*
 * color conventions
 */
/**
 * flag for darkmode.
 * @const
 * @type {boolean}
 */
darkmode: false,
/**
 * color for drawing valid constraints.
 * @return {string}
 */
get validConstraintColor() { return this.darkmode ? '#ffffff99' : '#777' },
/**
 * color for drawing invalid constraints.
 * @const
 * @type {string}
 */
invalidConstraintColor: '#b11',
/**
 * color for drawing forces.
 * @return {string}
 */
get forceColor() { return this.darkmode ? 'crimson' : 'orange' },
/**
 * color for drawing springs.
 * @return {string}
 */
get springColor() { return this.darkmode ? 'lightslategray' : '@linkcolor' },
/**
 * color for vectortypes of constraints.
 * @return {string}
 */
get constraintVectorColor() { return this.darkmode ? 'orange' : 'green' },
/**
 * hovered element shading color.
 * @return {string}
 */
get hoveredElmColor() { return this.darkmode ? 'white' : 'gray' },
/**
 * selected element shading color.
 * @return {string}
 */
get selectedElmColor() { return this.darkmode ? 'yellow': 'blue' },
/**
 * color for g2.txt (ls).
 * @return {string}
 */
get txtColor() { return this.darkmode ? 'white' : 'black' },
/**
 * color for velocity arrow (ls).
 * @return {string}
 */
get velColor() { return this.darkmode ? 'lightblue' : 'mediumblue' },
/**
 * color for acceleration arrow (ls).
 * @return {string}
 */
get accColor() { return this.darkmode ? 'wheat' : 'saddlebrown' },

/**
 * default gravity.
 * @const
 * @type {object}
 */
gravity: {x:0,y:-10,active:false},
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
 * convert [N/m] => [kg/s^2] = [N/m] (spring rate)
 * @return {number} Value in [N/m]
 */
to_N_m(x) { return x; },
/**
 * convert [N/m] = [kg/s^2] => [k/s^2]
 * @return {number} Value in [kg/s^2]
 */
from_N_m(x) { return x; },
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
from_kgm2(x) { return x/mec.m_u/mec.m_u; },
/*
 * scale factors
 */
velScale: 1/4, 
/*
 * scale factors
 */
accScale: 1/10, 
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
 * If the absolute value of a number `a` is smaller than eps, it is set to zero.
 * @param {number} a Value to test.
 * @param {number} [eps=mec.EPS]  used epsilon.
 * @returns {number} original value or zero.
 */
toZero(a,eps) {
    return a < (eps || mec.EPS) && a > -(eps || mec.EPS) ? 0 : a;
},
/**
 * Clamps a numerical value linearly within the provided bounds.
 * @param {number} val Value to clamp.
 * @param {number} lo Lower bound.
 * @param {number} hi Upper bound.
 * @returns {number} Value within the bounds.
 */
clamp(val,lo,hi) { return Math.min(Math.max(val, lo), hi); },
/**
 * Clamps a numerical value asymptotically within the provided bounds.
 * @param {number} val Value to clamp.
 * @param {number} lo Lower bound.
 * @param {number} hi Upper bound.
 * @returns {number} Value within the bounds.
 */
asympClamp(val,lo,hi) {
    const dq = 0.5*(hi - lo);
    return dq ? lo + 0.5*dq + Math.tanh(((Math.min(Math.max(val, lo), hi) - lo)/dq - 0.5)*5)*0.5*dq : lo;
},
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
}/**
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
        asJSON() {
            return '{ "id":"'+this.id+'","x":'+this.x0+',"y":'+this.y0
                 + (this.base ? ',"base":true' : '')
                 + (this.idloc ? ',"idloc":"'+this.idloc+'"' : '')
                 + ' }';
        },
        toJSON() {
            const obj = {
                id: this.id,
                x: this.x,
                y: this.y
            };
            if (this.base)
                obj.base = true;
            if (this.idloc)
                obj.idloc = this.idloc;

            return obj;
        },
        // analysis methods
        force() { return {x:this.Qx,y:this.Qy}; },
        vel() { return {x:this.xt,y:this.yt}; },
        acc() { return {x:this.xtt,y:this.ytt}; },
        forceAbs() { return Math.hypot(this.Qx,this.Qy); },
        velAbs() { return Math.hypot(this.xt,this.yt); },
        accAbs() { return Math.hypot(this.xtt,this.ytt); },
        // interaction
        get isSolid() { return true },
        get sh() { return this.state & g2.OVER ? [0, 0, 10, mec.hoveredElmColor] : this.state & g2.EDIT ? [0, 0, 10, mec.selectedElmColor] : false; },
        _info() { return `x:${this.x}<br>y:${this.y}` },
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
                g.txt({str:this.id||'?',x:xid,y:yid,thal:'center',tval:'middle',ls:mec.txtColor});
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
        get type() {
            const ori = this.ori, len = this.len;
            return ori.type === 'free' && len.type === 'free' ? 'free'
                 : ori.type === 'free' && len.type !== 'free' ? 'rot'
                 : ori.type !== 'free' && len.type === 'free' ? 'tran'
                 : ori.type !== 'free' && len.type !== 'free' ? 'ctrl'
                 : 'invalid';
        },
        get initialized() { return typeof this.p1 === 'object' },
        get dof() {
            return (this.ori.type === 'free' ? 1 : 0) + 
                   (this.len.type === 'free' ? 1 : 0);
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
            let res;
//            console.log(dt)
            return this.type === 'free' ? true
                 : this.type === 'rot'  ? this.len_vel(dt)
                 : this.type === 'tran' ? this.ori_vel(dt)
//                 : this.type === 'ctrl' ? !!((+this.ori_vel(dt))*(+this.len_vel(dt)))
                 : this.type === 'ctrl' ? (res = this.ori_vel(dt), (this.len_vel(dt) && res))
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
            if (this.ori.type === 'ref') { // surprise .. need to investigate further ..
                this.ori.ref.lambda_w = 0;
            }
        },
        post(dt) {
            this.lambda_r += this.dlambda_r;
            this.lambda_w += this.dlambda_w;
            if (this.ori.type === 'ref') { // surprise .. need to investigate further ..
                this.ori.ref.lambda_w += this.ori.ratio*this.dlambda_w;
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
        get ori_mc() { 
            let imc = mec.toZero(this.p1.im + this.p2.im);
            return imc ? 1/imc : 0;
        },
        ori_pos() {
            const C = this.ori_C,
                  factor = 1, // Math.max(Math.abs(C.x)/mec.maxLinCorrect,
                              //      Math.abs(C.y)/mec.maxLinCorrect,1),
                  mc = this.ori_mc,
                  impulse = { x: -mc * (C.x /= factor), 
                              y: -mc * (C.y /= factor) };

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
        get len_mc() {
            let imc = mec.toZero(this.p1.im + this.p2.im);
            return (imc ? 1/imc : 0) * this.r0**2/(this.ax**2 + this.ay**2); 
        },
        len_pos() {
//            const C = mec.clamp(this.len_C,-mec.maxLinCorrect,mec.maxLinCorrect), 
            const C = this.len_C, 
                  impulse = -this.len_mc * C;

//console.log('h: '+this.len_mc)
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
        toJSON() {
            const obj = {
                id: this.id,
                p1: this.p1.id,
                p2: this.p2.id
            };

            if (this.len)
                obj.len = { type: this.len.type };
            if (this.len.type === 'ref')
                obj.len.ref = this.len.ref.id;
            if (this.ori.type === 'drive') {
                obj.len.func = this.len.func;
                obj.len.Dt = this.len.Dt;
                obj.len.Dw = this.len.Dw;
                obj.len.input = this.len.input;
                obj.len.output = this.len.output;
            };

            if (this.ori)
                obj.ori = { type: this.ori.type };
            if (this.ori.type === 'ref')
                obj.ori.ref = this.ori.ref.id;
            if (this.ori.type === 'drive') {
                obj.ori.func = this.ori.func;
                obj.ori.Dt = this.ori.Dt;
                obj.ori.Dw = this.ori.Dw;
                obj.ori.input = this.ori.input;
                obj.ori.output = this.ori.output;
            };

            return obj;
        },
        // interaction
        get isSolid() { return false },
        get sh() { return this.state & g2.OVER ? [0, 0, 10, mec.hoveredElmColor] : this.state & g2.EDIT ? [0, 0, 10, mec.selectedElmColor] : false; },
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
                                ls:mec.constraintVectorColor,fs:'@ls',lc:'round',sh:()=>this.sh})
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
                g.txt({str:idstr,x:xid,y:yid,thal:'center',tval:'middle', ls:mec.txtColor})
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
}/**
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
 * @param {object} - plain javascript load object.
 * @property {string} id - load id.
 * @property {string} type - load type ['force'|'spring'].
 */
mec.load = {
    extend(load) { 
        if (!load.type)
            load.type = 'force';
        if (mec.load[load.type]) {
            Object.setPrototypeOf(load, mec.load[load.type]);
            load.constructor(); 
        }
        return load; 
    }
}

/**
 * @param {object} - force load.
 * @property {string} p - node id, the force is acting upon.
 * @property {string} [wref] - constraint id, the force orientation is referring to.
 * @property {number} [value=1] - Force value in [N]
 * @property {number} [w0=0] - initial / offset orientation of force vector.
 * @property {number} [mode='pull'] - drawing mode of force arrow ['push'|'pull'] with regard to node.
 */
mec.load.force = {
    constructor() {}, // always parameterless .. !
    init(model) {
        this.model = model;
        this.init_force(model);
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
    toJSON() {
        const obj = {
            type: this.type,
            id: this.id,
            p: this.p.id
        };

        if (this.w0 && !(this.w0 === 0))
            obj.w0 = this.w0;
        if (this.wref)
            obj.wref = this.wref;
        if (this.value && Math.abs(mec.to_N(this.value) - 1) > 0.0001)  // if (this.value && !(mec.to_N(this.value) === 1))  
            obj.value = mec.to_N(this.value);

        return obj;
    },

 // cartesian components
    get w() { return this.wref ? this.wref.w + this.w0 : this.w0; },
    get Qx() { return this.value*Math.cos(this.w)},
    get Qy() { return this.value*Math.sin(this.w)},
    reset() {},
    apply() {
        this.p.Qx += mec.from_N(this.Qx);
        this.p.Qy += mec.from_N(this.Qy);
    },
    // interaction
    get isSolid() { return false },
    // get sh() { return this.state & g2.OVER ? [0,0,4,"gray"] : false },
    get sh() { return this.state & g2.OVER ? [0, 0, 10, 'white'] : this.state & g2.EDIT ? [0, 0, 10, 'yellow'] : false; },
    hitContour({x,y,eps}) {
        const len = 45,   // const length for all force arrows
              p = this.p,
              cw = Math.cos(this.w), sw = Math.sin(this.w),
              off = 2*mec.node.radius,
              x1 = this.mode === 'push' ? p.x - (len+off)*cw
                                        : p.x + off*cw,
              y1 = this.mode === 'push' ? p.y - (len+off)*sw
                                        : p.y + off*sw;
         return g2.isPntOnLin({x,y},{x:x1+off*cw, y:y1+off*sw},
                                    {x:x1+(len+off)*cw,y:y1+(len+off)*sw},eps);
    },
    g2() {
        const w = this.w,
              cw = Math.cos(w), sw = Math.sin(w),
              p = this.p,
              len = mec.load.force.arrowLength,
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
                      .drw({d:mec.load.force.arrow,lsh:true})
                      .end();
        if (mec.showLoadLabels)
            g.txt({str:this.id||'?',x:xid,y:yid,thal:'center',tval:'middle',ls:mec.txtColor});
        return g;
    },
    arrowLength: 45,   // draw all forces of length ...
    arrow: 'M0,0 35,0M45,0 36,-3 37,0 36,3 Z'
}

/**
 * @param {object} - spring load.
 * @property {string} [p1] - referenced node id 1.
 * @property {string} [p2] - referenced node id 2.
 * @property {number} [k] - spring rate.
 * @property {number} [len0] - unloaded spring length. If not given, 
 * the initial distance between p1 and p2 is taken.
 */
mec.load.spring = {
    constructor() {}, // always parameterless .. !
    init(model) {
        this.model = model;
        this.init_spring(model);
    },
    init_spring(model) {
        if (typeof this.p1 === 'string')
            this.p1 = model.nodeById(this.p1);
        if (typeof this.p2 === 'string')
            this.p2 = model.nodeById(this.p2);
        this.k = mec.from_N_m(this.k || 0.01);
        this.len0 = typeof this.len0 === 'number' 
                  ? this.len0 
                  : Math.hypot(this.p2.x-this.p1.x,this.p2.y-this.p1.y);
    },
    /**
     * Check load for dependencies on another element.
     * @method
     * @param {object} elem - element to test dependency for.
     * @returns {boolean} true, dependency exists.
     */
    dependsOn(elem) {
        return this.p1 === elem || this.p2 === elem;
    },
    toJSON() {
        const obj = {
            type: this.type,
            id: this.id,
            p1: this.p1.id,
            p2: this.p2.id
        };
console.log(Math.abs(this.len0 - Math.hypot(this.p2.x0-this.p1.x0,this.p2.y0-this.p1.y0)));
        if (this.k && !(mec.to_N_m(this.k) === 0.01))
            obj.k = mec.to_N_m(this.k);
        if (this.len0 && Math.abs(this.len0 - Math.hypot(this.p2.x0-this.p1.x0,this.p2.y0-this.p1.y0)) > 0.0001)
            obj.len0 = this.len0;

        return obj;
    },

    // cartesian components
    get len() { return Math.hypot(this.p2.y-this.p1.y,this.p2.x-this.p1.x); },
    get w() { return Math.atan2(this.p2.y-this.p1.y,this.p2.x-this.p1.x); },
    get force() { return this.k*(this.len - this.len0); },
    get Qx() { return this.force*Math.cos(this.w)},
    get Qy() { return this.force*Math.sin(this.w)},
    reset() {},
    apply() {
        const f = this.force, w = this.w,
              Qx = f * Math.cos(w), Qy = f * Math.sin(w);
        this.p1.Qx += Qx;
        this.p1.Qy += Qy;
        this.p2.Qx -= Qx;
        this.p2.Qy -= Qy;
    },
    // interaction
    get isSolid() { return false },
    // get sh() { return this.state & g2.OVER ? [0,0,4,"gray"] : false },
    get sh() { return this.state & g2.OVER ? [0, 0, 10, 'white'] : this.state & g2.EDIT ? [0, 0, 10, 'yellow'] : false; },
    hitContour({x,y,eps}) {
        const p1 = this.p1, p2 = this.p2,
              cw = Math.cos(this.w), sw = Math.sin(this.w),
              off = 2*mec.node.radius;
        return g2.isPntOnLin({x,y},{x:p1.x+off*cw, y:p1.y+off*sw},
                                   {x:p2.x-off*cw, y:p2.y-off*sw},eps);
    },
    g2() {
        const h = 16;
        const x1 = this.p1.x, y1 = this.p1.y;
        const x2 = this.p2.x, y2 = this.p2.y;
        const len = Math.hypot(x2-x1,y2-y1);
        const xm = (x1+x2)/2;
        const ym = (y1+y2)/2;
        const ux = (x2-x1)/len;
        const uy = (y2-y1)/len;
        const off = 2*mec.node.radius;
        return g2().p()
                   .m({x:x1+ux*off,y:y1+uy*off})
                   .l({x:xm-ux*h/2,y:ym-uy*h/2})
                   .l({x:xm+(-ux/6+uy/2)*h,y:ym+(-uy/6-ux/2)*h})
                   .l({x:xm+( ux/6-uy/2)*h,y:ym+( uy/6+ux/2)*h})
                   .l({x:xm+ux*h/2,y:ym+uy*h/2})
                   .l({x:x2-ux*off,y:y2-uy*off})
                   .stroke(Object.assign({}, {ls:mec.springColor},this,{fs:'transparent',lc:'round',lw:2,lj:'round',sh:()=>this.sh,lsh:true}));
    }
}/**
 * mec.shape (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.node.js
 * @requires mec.constraint.js
 * @requires mec.model.js
 * @requires g2.js
 */
"use strict";

/**
 * @method
 * @param {object} - plain javascript shape object.
 * @property {string} id - view id.
 * @property {string} type - view type ['vector'].
 */
mec.view = {
    extend(view) {
        if (view.type && mec.view[view.type]) {
            Object.setPrototypeOf(view, mec.view[view.type]);
            view.constructor();
        }
        return view; 
    }
}

/**
 * @param {object} - vector view.
 * @property {string} p - referenced node id.
 * @property {string} [value] - node value to view.
 */
mec.view.vector = {
    constructor() {}, // always parameterless .. !
    init(model) {
        if (typeof this.p === 'string')
            this.p = model.nodeById(this.p);
        if (this.value && this.p[this.value]) ; // node analysis value exists ? error handling required .. !
    },
    dependsOn(elem) {
        return this.p === elem;
    },
    draw(g) {
        g.vec({ x1:()=>this.p.x,
                y1:()=>this.p.y,
                x2:()=>this.p.x+this.p[this.value]().x,
                y2:()=>this.p.y+this.p[this.value]().y,
                ls:mec.velColor,
                lw:1.5});
    }
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

/**
 * @method
 * @param {object} - plain javascript shape object.
 * @property {string} type - shape type ['fix'|'flt'|'slider'|'bar'|'beam'|'wheel'|'img'].
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
 * @property {number} [w0] - initial angle.
 */
mec.shape.fix = {
    init(model) {
        if (typeof this.p === 'string')
            this.p = model.nodeById(this.p);
    },
    dependsOn(elem) {
        return this.p === elem;
    },
    toJSON() {
        const obj = {
            type: this.type,
            p: this.p.id,
        };

        if (this.w0 && !(this.w0 === 0))
            obj.w0 = this.w0;

        return obj;
    },
    draw(g) {
        g.use({grp:'nodfix',x:()=>this.p.x,y:()=>this.p.y,w:this.w0 || 0});
    }
}

/**
 * @param {object} - floating node shape.
 * @property {string} p - referenced node id for position.
 * @property {number} [w0] - initial angle.
 */
mec.shape.flt = {
    init(model) {
        if (typeof this.p === 'string')
            this.p = model.nodeById(this.p);
    },
    dependsOn(elem) {
        return this.p === elem;
    },
    toJSON() {
        const obj = {
            type: this.type,
            p: this.p.id,
        };

        if (this.w0 && !(this.w0 === 0))
            obj.w0 = this.w0;

        return obj;
    },
    draw(g) {
        g.use({grp:'nodflt',x:()=>this.p.x,y:()=>this.p.y,w:this.w0 || 0});
    }
}

/**
 * @param {object} - slider shape.
 * @property {string} p - referenced node id for position.
 * @property {string} [wref] - referenced constraint id for orientation.
 * @property {number} [w0] - initial angle / -difference.
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
    toJSON() {
        const obj = {
            type: this.type,
            p: this.p.id,
        };

        if (this.w0 && !(this.w0 === 0))
            obj.w0 = this.w0;
        if (this.wref)
            obj.wref = this.wref.id;

        return obj;
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
 * @property {string} p1 - referenced node id for start point position.
 * @property {string} p2 - referenced node id for end point position.
 */
mec.shape.bar = {
    init(model) {
        if (typeof this.p1 === 'string' && typeof this.p2 === 'string') {
            this.p1 = model.nodeById(this.p1);
            this.p2 = model.nodeById(this.p2);
        }
    },
    dependsOn(elem) {
        return this.p1 === elem || this.p2 === elem;
    },
    toJSON() {
        const obj = {
            type: this.type,
            p1: this.p1.id,
            p2: this.p2.id,
        };

        return obj;
    },
    draw(g) {
        const x1 = () => this.p1.x,
              y1 = () => this.p1.y,
              x2 = () => this.p2.x,
              y2 = () => this.p2.y;
        g.lin({x1,y1,x2,y2,ls:"@nodcolor",lw:8,lc:"round"})
         .lin({x1,y1,x2,y2,ls:"@nodfill2",lw:5.5,lc:"round"})
         .lin({x1,y1,x2,y2,ls:"@nodfill",lw:3,lc:"round"})
    }
}

/**
 * @param {object} - beam shape.
 * @property {string} p - referenced node id for start point position.
 * @property {string} wref - referenced constraint id for orientation.
 * @property {number} len - beam length
 */
mec.shape.beam = {
    init(model) {
        if (typeof this.wref === 'string' && this.len > 0) {
            this.p = model.nodeById(this.p);
            this.wref = model.constraintById(this.wref);
        } else {
            console.log('invalid definition of beam shape in model');
        }
    },
    dependsOn(elem) {
        return this.p === elem || this.wref === elem;
    },
    toJSON() {
        const obj = {
            type: this.type,
            p: this.p.id,
            wref: this.wref.id,
            len: this.len
        };

        return obj;
    },
    draw(g) {
        const x1 = () => this.p.x,
              y1 = () => this.p.y,
              x2 = () => this.p.x + this.len*Math.cos(this.wref.w),
              y2 = () => this.p.y + this.len*Math.sin(this.wref.w);
        g.lin({x1,y1,x2,y2,ls:"@nodcolor",lw:8,lc:"round"})
         .lin({x1,y1,x2,y2,ls:"@nodfill2",lw:5.5,lc:"round"})
         .lin({x1,y1,x2,y2,ls:"@nodfill",lw:3,lc:"round"})
    }
}

/**
 * @param {object} - wheel shape.
 * @property {string} p - referenced node id for center point position, and ...
 * @property {string} [wref] - referenced constraint id for orientation and ...
 * @property {number} w0 - start / offset angle [rad].
 * @property {number} r - radius
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
    toJSON() {
        const obj = {
            type: this.type,
            p: this.p.id,
            w0: this.w0,
            r: this.r
        };

        if (this.wref)
            obj.wref = this.wref.id;

        return obj;
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
 * @property {string} uri - image uri
 * @property {string} p - referenced node id for center point position.
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
    toJSON() {
        const obj = {
            type: this.type,
            uri: this.uri,
            p: this.p.id
        };

        if (this.wref)
            obj.wref = this.wref.id;
        if (this.w0 && !(this.w0 === 0))
            obj.w0 = this.w0;
        if (this.xoff && !(this.xoff === 0))
            obj.xoff = this.xoff;
        if (this.yoff && !(this.yoff === 0))
            obj.yoff = this.yoff;
        if (this.scl && !(this.scl === 1))
            obj.scl = this.scl;

        return obj;
    },
    draw(g) {
        const w0 = this.w0 || 0, w = this.wref ? ()=>this.wref.w + w0 : w0; 
        g.img({uri:this.uri,x:()=>this.p.x,y:()=>this.p.y,w,scl:this.scl,xoff:this.xoff,yoff:this.yoff})
    }
}/**
 * mec.model (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.node.js
 * @requires mec.constraint.js
 * @requires mec.drive.js
 * @requires mec.load.js
 * @requires mec.shape.js
 */
"use strict";

/**
 * Wrapper class for extending plain model objects, usually generated from a JSON object.
 * @method
 * @returns {object} model object.
 * @param {object} - plain javascript model object.
 * @property {string} id - model id.
 * @property {boolean|object} gravity - Vector `{x,y}` of gravity or `{x:0,y:-10}` in case of `true`.
 * @property {array} nodes - Array of node objects.
 * @property {array} constraints - Array of constraint objects.
 * @property {array} shapes - Array of shape objects.
 */
mec.model = {
    extend(model) { 
        Object.setPrototypeOf(model, this.prototype); 
        model.constructor(); 
        return model; 
    },
    prototype: {
        constructor() { // always parameterless .. !
            this.state = {dirty:true,valid:true,direc:1,itrpos:0,itrvel:0};
            this.timer = {t:0,dt:1/60};
        },
        /**
         * Init model
         * @method
         * @returns {object} model
         */
        init() {
            if (!this.nodes) this.nodes = [];
            for (const node of this.nodes)  // do for all nodes ...
                mec.node.extend(node).init(this);
            if (!this.constraints) this.constraints = [];
            for (const constraint of this.constraints)  // do for all constraints ...
                if (!constraint.initialized)
                    mec.constraint.extend(constraint).init(this);
            if (!this.loads) this.loads = [];
            for (const load of this.loads)  // do for all loads ...
                mec.load.extend(load).init(this);
            if (!this.views) this.views = [];
            for (const view of this.views)  // do for all views ...
                mec.view.extend(view).init(this);
            if (!this.shapes) this.shapes = [];
            for (const shape of this.shapes)  // do for all shapes ...
                mec.shape.extend(shape).init(this);

            if (this.gravity === true)
                this.gravity = Object.assign({},mec.gravity,{active:true});
            else if (!this.gravity)
                this.gravity = Object.assign({},mec.gravity,{active:false});

            return this;
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
            for (const node of this.nodes)
                node.reset();
            for (const constraint of this.constraints)
                constraint.reset();
            for (const load of this.loads)  // do for all shapes ...
                load.reset();
            Object.assign(this.state,{valid:true,direc:1,itrpos:0,itrvel:0});
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
         * Input elements may set simulation time and `dt` explicite.
         * `model.tick()` is then called with `dt = 0`.
         * @method
         * @param {number} [dt=0] - time increment.
         * @returns {object} model
         */
        tick(dt) {
            if (dt)  // sliders are setting simulation time explicite .. !
                this.timer.t += (this.timer.dt = dt);
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
            for (const node of this.nodes)
                dof += node.dof;
            for (const constraint of this.constraints)
                dof -= (2 - constraint.dof);
            return dof;
        },
        /**
         * Gravity (vector) value.
         * @type {boolean}
         */
        get hasGravity() { return this.gravity.active; },

        get dirty() { return this.state.dirty; },  // deprecated !!
        set dirty(q) { this.state.dirty = q; },
        get valid() { return this.state.valid; },
        set valid(q) { this.state.valid = q; },
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
         * Direction flag.
         * Used implicite by slider input elements.
         * Avoids setting negative `dt` by going back in time.
         * @type {boolean}
         */
        get direc() { return this.state.direc; },
        set direc(q) { this.state.direc = q; },
        /**
         * Test, if model is active.
         * Nodes are moving (nonzero velocities) or active drives.
         * @type {boolean}
         */
        get isActive() {
            return  this.hasActiveDrives // node velocities are not necessarily zero with drives
                || !this.isSleeping;
        },
        /**
         * Test, if nodes are significantly moving 
         * @type {boolean}
         */
        get isSleeping() {
            let sleeping = true;
            for (const node of this.nodes)
                sleeping = sleeping && node.isSleeping;
            return sleeping;
        },
        /**
         * Test, if some drives are 'idle' or 'running' 
         * @const
         * @type {boolean}
         */
        get hasActiveDrives() {
            let active = false;
            for (const constraint of this.constraints) 
                active = active
                      || constraint.ori.type === 'drive'
                      && this.timer.t < constraint.ori.t0 + constraint.ori.Dt
                      || constraint.len.type === 'drive'
                      && this.timer.t < constraint.len.t0 + constraint.len.Dt;
            return active;
        },
        /**
         * Check, if other elements are dependent on specified element.
         * @method
         * @param {object} elem - element.
         * @returns {boolean} true in case of existing dependents.
         */
        hasDependents(elem) {
            let dependency = false;
            for (const constraint of this.constraints) 
                dependency = constraint.dependsOn(elem) || dependency;
            for (const load of this.loads)
                dependency = load.dependsOn(elem) || dependency;
            for (const view of this.views)
                dependency = view.dependsOn(elem) || dependency;
            for (const shape of this.shapes)
                dependency = shape.dependsOn(elem) || dependency;
            return dependency;
        },
        /**
         * Get dependents of a specified element.
         * As a result a dictionary object containing dependent elements is created:
         * `{constraints:[], loads:[], shapes:[]}`
         * @method
         * @param {object} elem - element.
         * @returns {object} dictionary object containing dependent elements.
         */
        dependentsOf(elem) {
            const deps = {constraints:[],loads:[],views:[],shapes:[]};
            for (const constraint of this.constraints)
                if (constraint.dependsOn(elem))
                    deps.constraints.push(constraint);
            for (const load of this.loads)
                if (load.dependsOn(elem))
                    deps.loads.push(load);
            for (const view of this.views)
                if (view.dependsOn(elem))
                    deps.views.push(view);
            for (const shape of this.shapes)
                if (shape.dependsOn(elem))
                    deps.shapes.push(shape);
            return deps;
        },
        /**
         * Purge all elements in an element dictionary.
         * @method
         * @param {object} elems - element dictionary.
         */
        purgeElements(elems) {
            for (const constraint of elems.constraints)
                this.constraints.splice(this.constraints.indexOf(constraint),1);
            for (const load of elems.loads)
                this.loads.splice(this.loads.indexOf(load),1);
            for (const view of elems.views)
                this.views.splice(this.views.indexOf(view),1);
            for (const shape of this.shapes)
                this.shapes.splice(this.shapes.indexOf(shape),1);
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
            const comma = (i,n) => i < n-1 ? ',' : '';
            const str = '{'
                      + '\n  "id":"'+this.id+'"'
                      + (this.gravity.active ? ',\n  "gravity":true' : '')  // in case of true, should also look at vector components  .. !
                      + (nodeCnt ? ',\n  "nodes": [\n' : '')
                      + (nodeCnt ? this.nodes.map((n,i) => '    '+n.asJSON()+comma(i,nodeCnt)+'\n').join('') : '')
                      + (nodeCnt ? '  ]\n' : '')
                      + '}';
            console.log(str);
            return str;
        },
            /**
         * Return a canonical JSON-representation of the model
         * @method
         * @returns {object} model as JSON.
         */
        toJSON() {
            const obj = {};

            if (this.id)
                obj.id = this.id;
            obj.dirty = true; // needed?
            if (this.dt)
                obj.dt = this.dt;
            obj.gravity = this.hasGravity ? true : false;

            if (this.nodes && this.nodes.length > 0) {
                const nodearr = [];
                for (const node of this.nodes)
                    nodearr.push(node.toJSON());
                obj.nodes = nodearr;
            };

            if (this.constraints && this.constraints.length > 0) {
                const constraintarr = [];
                for (const constraint of this.constraints)
                    constraintarr.push(constraint.toJSON());
                obj.constraints = constraintarr;
            };

            if (this.loads && this.loads.length > 0) {
                const loadarr = [];
                for (const load of this.loads)
                    loadarr.push(load.toJSON());
                obj.loads = loadarr;
            };

            if (this.shapes && this.shapes.length > 0) {
                const shapearr = [];
                for (const shape of this.shapes)
                    shapearr.push(shape.toJSON());
                obj.shapes = shapearr;
            };

            return obj;
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
                if (!node.base) {
                    node.Qx = node.Qy = 0;
                    if (this.hasGravity) {
                        node.Qx = node.m*mec.from_N(this.gravity.x);
                        node.Qy = node.m*mec.from_N(this.gravity.y);
                    }
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
            return valid;
        },
        /**
         * Velocity iteration step over all constraints.
         * @method
         * @returns {object} model
         */
        velStep() {
            let valid = true;  // pre-assume valid constraints velocities ...
//            console.log('dt='+this.dt)
            for (const constraint of this.constraints) {
//                console.log(constraint.vel(this.timer.dt)+ '&&'+ valid)
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
            this.applyLoads();
            // pre process nodes
            for (const node of this.nodes)
                node.pre(this.timer.dt);
            // pre process constraints
            for (const constraint of this.constraints)
                constraint.pre(this.timer.dt);
            // eliminate drift ...
            this.asmPos(this.timer.dt);

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
// console.log('itr='+this.itrCnt.pos+'/'+this.itrCnt.vel);
            return this;
        },
        /**
         * Draw model.
         * @method
         * @param {object} g - g2 object.
         * @returns {object} model
         */
        draw(g) {
            for (const shape of this.shapes)
                shape.draw(g);
            for (const view of this.views)
                view.draw(g);
            for (const load of this.loads)
                g.ins(load);
            for (const constraint of this.constraints)
                g.ins(constraint);
            for (const node of this.nodes)
                g.ins(node);
            return this;
        }
    }
}