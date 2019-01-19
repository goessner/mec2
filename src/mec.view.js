/**
 * mec.view (c) 2018 Stefan Goessner
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
 * @param {object} - plain javascript view object.
 * @property {string} id - view id.
 * @property {string} type - view type ['vector','trace','info'].
 */
mec.view = {
    extend(view) {
        if (view.as && mec.view[view.as]) {
            Object.setPrototypeOf(view, mec.view[view.as]);
            view.constructor();
        }
        return view;
    }
}

/**
 * @param {object} - point view.
 * @property {string} show - kind of property to show as point.
 * @property {string} of - element property belongs to.
 */
mec.view.point = {
    constructor() {}, // always parameterless .. !
    /**
     * Check point view properties for validity.
     * @method
     * @param {number} idx - index in views array.
     * @returns {boolean} false - if no error / warning was detected. 
     */
    validate(idx) {
        if (this.of === undefined) 
            return { mid:'E_ELEM_MISSING',elemtype:'view as point',id:this.id,idx,reftype:'element',name:'of'};
        if (!this.model.elementById(this.of)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'view as point',id:this.id,idx,reftype:'element',name:this.of};
        else
            this.of = this.model.elementById(this.of);

        if (this.show && !(this.show in this.of))
            return { mid:'E_ALY_PROP_INVALID',elemtype:'view as point',id:this.id,idx,reftype:this.of,name:this.show};
        
        return false;
    },
    /**
     * Initialize view. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in views array.
     */
    init(model,idx) {
        this.model = model;
        this.model.notifyValid(this.validate(idx));
        this.p = Object.assign({},this.of[this.show]);
        this.p.r = this.r;
    },
    dependsOn(elem) {
        return this.of === elem || this.ref === elem;
    },
    reset() {
        Object.assign(this.p,this.of[this.show]);
    },
    post() { 
        Object.assign(this.p,this.of[this.show]);
    },
    asJSON() {
        return '{ "show":"'+this.show+'","of":"'+this.of.id+'","as":"point" }';
    },
    // interaction
    get r() { return 6; },
    get isSolid() { return true },
    get sh() { return this.state & g2.OVER ? [0, 0, 10, this.model.env.show.hoveredElmColor] : false; },
    hitInner({x,y,eps}) {
        return g2.isPntInCir({x,y},this.p,eps);
    },
    g2() {
        return this.g2cache
            || (this.g2cache = g2().beg({x:()=>this.p.x,y:()=>this.p.y,sh:()=>this.sh})
                                     .cir({r:6,fs:'snow'})
                                     .cir({r:2.5,fs:'@ls',ls:'transparent'})
                                   .end());
    },
    draw(g) { g.ins(this); },
}

/**
 * @param {object} - vector view.
 * @property {string} show - kind of property to show as vector.
 * @property {string} of - element property belongs to.
 * @property {string} [at] - node id as anchor to show vector at.
 */
mec.view.vector = {
    constructor() {}, // always parameterless .. !
    /**
     * Check vector view properties for validity.
     * @method
     * @param {number} idx - index in views array.
     * @returns {boolean} false - if no error / warning was detected. 
     */
    validate(idx) {
        if (this.show === undefined) 
            return { mid:'E_SHOW_PROP_MISSING',elemtype:'view as vector',id:this.id,idx,name:'show'};
        if (this.of === undefined) 
            return { mid:'E_ELEM_REF_MISSING',elemtype:'view as vector',id:this.id,idx,reftype:'node',name:'of'};
        if (!this.model.elementById(this.of)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'view as vector',id:this.id,idx,reftype:'node',name:this.of};
        else
            this.of = this.model.elementById(this.of);

        if (this.at === undefined) {
            if ('pos' in this.of)
                Object.defineProperty(this, 'anchor', { get: () => this.of['pos'], enumerable:true, configurable:true });
            else
                return { mid:'E_SHOW_VEC_ANCHOR_MISSING',elemtype:'view as vector',id:this.id,idx,name:'at' };
        }
        else {
            if (this.model.nodeById(this.at)) {
                let at = this.model.nodeById(this.at);
                Object.defineProperty(this, 'anchor', { get: () => at['pos'], enumerable:true, configurable:true });
            }
            else if (this.at in this.of)
                Object.defineProperty(this, 'anchor', { get: () => this.of[this.at], enumerable:true, configurable:true });
            else
                return { mid:'E_SHOW_VEC_ANCHOR_INVALID',elemtype:'view as vector',id:this.id,idx,name:'at' };
        }
        
        return false;
    },
    /**
     * Initialize view. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in views array.
     */
    init(model,idx) {
        this.model = model;
        this.model.notifyValid(this.validate(idx));
        this.p = Object.assign({},this.anchor);
        this.v = Object.assign({},this.of(this.show));
    },
    dependsOn(elem) {
        return this.of === elem || this.at === elem;
    },
    reset() {},
    asJSON() {
        return '{ "show":"'+this.show+'","of":"'+this.of.id+'","as":"vector" }';
    },
    // interaction
    get isSolid() { return false },
    get sh() { return this.state & g2.OVER ? [0, 0, 10, this.model.env.show.hoveredElmColor] : false; },
    get endPoints() {
        const scale = mec.aly[this.show].drwscl;
        const p = this.anchor;
        const v = this.of[this.show];
        const vabs = Math.hypot(v.y,v.x);
        const vview = !mec.isEps(vabs,0.5)
                    ? mec.asympClamp(scale*vabs,25,100)
                    : 0;
        return { p1:p,
                 p2:{ x:p.x + v.x/vabs*vview, y:p.y + v.y/vabs*vview }
        };
    },
    hitContour({x,y,eps}) {
        const pts = this.endPoints;
        return g2.isPntOnLin({x,y},pts.p1,pts.p2,eps);
    },
    g2() {
        const pts = this.endPoints;
        return this.g2cache
        || (this.g2cache = g2().vec({x1:pts.p1.x,
                         y1:pts.p1.y,
                         x2:pts.p2.x,
                         y2:pts.p2.y,
                         ls:this.model.env.show[this.show+'VecColor'],
                         lw:1.5,
                         sh:this.sh
        }));
    },
    draw(g) { g.ins(this); },
}

/**
 * @param {object} - trace view.
 * @property {string} show - kind of property to show as trace.
 * @property {string} of - element property belongs to.
 * @property {string} ref - reference constraint id.
 * @property {string} [mode='dynamic'] - ['static','dynamic','preview'].
 * @property {string} [p] - node id to trace ... (deprecated .. use 'show':'pos' now!)
 * @property {number} [t0=0] - trace begin [s].
 * @property {number} [Dt=1] - trace duration [s].
 * @property {string} [stroke='navy'] - stroke web color.
 * @property {string} [fill='transparent'] - fill web color.
 */
mec.view.trace = {
    constructor() {
        this.pts = [];  // allocate array
    }, // always parameterless .. !
    /**
     * Check vector view properties for validity.
     * @method
     * @param {number} idx - index in views array.
     * @returns {boolean} false - if no error / warning was detected. 
     */
    validate(idx) {
        if (this.of === undefined)
            return { mid:'E_ELEM_MISSING',elemtype:'view as trace',id:this.id,idx,reftype:'element',name:'of'};
        if (!this.model.elementById(this.of)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'view as trace',id:this.id,idx,reftype:'element',name:this.of};
        else
            this.of = this.model.elementById(this.of);

        if (this.show && !(this.show in this.of))
            return { mid:'E_ALY_INVALID_PROP',elemtype:'view as trace',id:this.id,idx,reftype:this.of,name:this.show};

        // (deprecated !)
        if (this.p) {
            if (!this.model.nodeById(this.p))
                return { mid:'E_ELEM_INVALID_REF',elemtype:'trace',id:this.id,idx,reftype:'node',name:this.p};
            else {
                this.show = 'pos';
                this.of = this.model.nodeById(this.p);
            }
        }
        
        return false;
    },
    /**
     * Initialize view. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in views array.
     */
    init(model,idx) {
        this.model = model;
        if (!this.model.notifyValid(this.validate(idx))) 
            return;

        this.t0 = this.t0 || 0;
        this.Dt = this.Dt || 1;
        this.mode = this.mode || 'dynamic';
        this.pts.length = 0;  // clear points array ...
    },
    dependsOn(elem) {
        return this.of === elem
            || this.ref === elem
            || this.p === elem;  // deprecated !!
    },
    build() {
        const t = this.model.timer.t,
              pnt = this.of[this.show],
              sw = this.ref ? Math.sin(this.ref.w) : 0,      // transform to ..
              cw = this.ref ? Math.cos(this.ref.w) : 1,      // reference system, i.e ...
              xp = pnt.x - (this.ref ? this.ref.p1.x : 0),   // `ref.p1` as origin ...
              yp = pnt.y - (this.ref ? this.ref.p1.y : 0),   
              p = {x:cw*xp+sw*yp,y:-sw*xp+cw*yp};
//console.log("wref="+this.wref)
        if (this.mode === 'static' || this.mode === 'preview') {
            if (this.t0 <= t && t <= this.t0 + this.Dt)
                this.pts.push(p);
        }
        else if (this.mode === 'dynamic') {
            if (this.t0 < t)
                this.pts.push(p);
            if (this.t0 + this.Dt < t)
                this.pts.shift();
        }
    },
    preview() {
        if (this.mode === 'preview')
            this.build();
    },
    reset(preview) {
        if (preview || this.mode !== 'preview')
            this.pts.length = 0;
    },
    post(dt) {  // add model.timer.t to parameter list .. or use timer as parameter everywhere !
        if (this.mode !== 'preview')
            this.build();
    },
    asJSON() {
        return '{ "show":"'+this.show+'"as":"'+this.as
                + (this.ref ? ',"ref":'+this.ref.id : '')
                + (this.mode !== 'dynamic' ? ',"mode":"'+this.mode+'"' : '')
                + (this.id ? ',"id":"'+this.id+'"' : '')
                + (this.Dt !== 1 ? ',"Dt":'+this.Dt : '')
                + (this.stroke && !(this.stroke === 'navy') ? ',"stroke":"'+this.stroke+'"' : '')
                + (this.fill && !(this.stroke === 'transparent') ? ',"fill":"'+this.fill+'"' : '')
                + ' }';
    },
    // interaction
    get isSolid() { return false },
    get sh() { return this.state & g2.OVER ? [0, 0, 10, this.model.env.show.hoveredElmColor] : false; },
    hitContour({x,y,eps}) {
        return false;
    },
    g2() {
        return this.g2cache
            || (this.g2cache = g2().ply({pts: this.pts,
                                        format: '{x,y}',
                                        x: this.ref ? ()=>this.ref.p1.x : 0,
                                        y: this.ref ? ()=>this.ref.p1.y : 0,
                                        w: this.ref ? ()=>this.ref.w : 0,
                                        ls: this.stroke || 'navy',
                                        lw: 1.5,
                                        fs: this.fill || 'transparent',
                                        sh: this.sh
        }));
    },
    draw(g) { g.ins(this); },
}
