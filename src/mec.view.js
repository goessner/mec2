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
 * @property {string} id - view id.
 * @property {string} type - view type ['vector','trace','info'].
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
    /**
     * Check vector view properties for validity.
     * @method
     * @param {number} idx - index in views array.
     * @returns {boolean} false - if no error / warning was detected. 
     */
    validate(idx) {
        const keys = ['vel','acc','force'];
        if (this.p === undefined) 
            return { mid:'E_ELEM_REF_MISSING',elemtype:'vector',id:this.id,idx,reftype:'node',name:'p'};
        if (!this.model.nodeById(this.p)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'vector',id:this.id,idx,reftype:'node',name:this.p};
        else
            this.p = this.model.nodeById(this.p);

        if (this.value === undefined) 
            return { mid:'E_ALY_REF_MISSING',elemtype:'vector',id:this.id,idx,reftype:'node',name:'value',keys:'['+keys.join(',')+']'};
        
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
    },
    dependsOn(elem) {
        return this.p === elem;
    },
    preview() {},
    reset() {},
    asJSON() {
        return '{ "type":"'+this.type+'","id":"'+this.id+'","p":"'+this.p.id+'"'
                + (this.value ? ',"value":"'+this.value+'"' : '')
                + ' }';
    },
    // interaction
    get isSolid() { return false },
    get sh() { return this.state & g2.OVER ? [0, 0, 10, this.model.env.show.hoveredElmColor] : false; },
    get endPoints() {
        const scale = mec.aly[this.value].drwscl;
        const v = this.p[this.value];
        const vabs = Math.hypot(v.y,v.x);
        const vview = !mec.isEps(vabs,0.5)
                    ? mec.asympClamp(scale*vabs,25,100)
                    : 0;
        return { p1:this.p,
                 p2:{ x:this.p.x + v.x/vabs*vview, y:this.p.y + v.y/vabs*vview }
        };
    },
    hitContour({x,y,eps}) {
        const pts = this.endPoints;
        return g2.isPntOnLin({x,y},pts.p1,pts.p2,eps);
    },
    g2() {
        const pts = this.endPoints;
        return g2().vec({x1:pts.p1.x,
                         y1:pts.p1.y,
                         x2:pts.p2.x,
                         y2:pts.p2.y,
                         ls:this.model.env.show[this.value+'VecColor'],
                         lw:1.5,
                         sh:this.sh
        });
    }
}

/**
 * @param {object} - trace view.
 * @property {string} p - referenced node id.
 * @property {number} [t0=0] - trace begin [s].
 * @property {number} [Dt=1] - trace duration [s].
 * @property {boolean} [mode='dynamic'] - ['static','dynamic','preview'].
 * @property {string} [stroke='navy'] - web color.
 * @property {string} [fill='transparent'] - web color.
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
        if (this.p === undefined) 
            return { mid:'E_ELEM_REF_MISSING',elemtype:'trace',id:this.id,idx,reftype:'node',name:'p'};
        if (!this.model.nodeById(this.p)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'trace',id:this.id,idx,reftype:'node',name:this.p};
        else
            this.p = this.model.nodeById(this.p);
        
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
        return this.p === elem;
    },
    build() {
        const t = this.model.timer.t;
        if (this.mode === 'static' || this.mode === 'preview') {
            if (this.t0 <= t && t <= this.t0 + this.Dt)
                this.pts.push({x:this.p.x,y:this.p.y});
        }
        else if (this.mode === 'dynamic') {
            if (this.t0 < t)
                this.pts.push({x:this.p.x,y:this.p.y});
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
        return '{ "type":"'+this.type+'","id":"'+this.id+'","p":"'+this.p.id+'"'
                + (this.Dt ? ',"Dt":'+this.Dt : '')
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
//    console.log('!')
        return g2().ply({pts: this.pts,
                         format: '{x,y}',
                         ls: this.stroke || 'navy',
                         lw: 1.5,
                         fs: this.fill || 'transparent',
                         sh: this.sh
        });
    }
}

/**
 * @param {object} - info view.
 * @property {string} elem - referenced elem id.
 * @property {string} value - elem value to view.
 * @property {string} [name] - elem value name to show.
 */
mec.view.info = {
    constructor() {}, // always parameterless .. !
    init(model) {
        if (typeof this.elem === 'string')
            this.elem = model.elementById(this.elem);
    },
    dependsOn(elem) {
        return this.elem === elem;
    },
    reset() {},
    asJSON() {
        return '{ "type":"'+this.type+'","id":"'+this.id+'","elem":"'+this.elem.id+'"'
                + (this.value ? ',"value":"'+this.value+'"' : '')
                + (this.name ? ',"name":"'+this.name+'"' : '')
                + ' }';
    },
    get hasInfo() {
        return this.elem.state === g2.OVER;  // exclude: OVER & DRAG
    },
    infoString() {
        if (this.value in this.elem) {
            const val = this.elem[this.value];
            const aly = mec.aly[this.value];
            const type = aly.type;
            const usrval = q => (q*aly.scl).toPrecision(3);

            return (this.name||aly.name||this.value) + ': '
                 + (type === 'vec' ? '{x:' + usrval(val.x)+',y:' + usrval(val.x)+'}'
                                   : usrval(val))
                 + ' ' + aly.unit;
        }
        return '?';
    }
}

/**
 * @param {object} - chart view.
*/
mec.view.chart = {
    constructor() {},
    init(model) {
        if (typeof this.p === 'string') this.p = model.nodeById(this.p);
        const getValue = (a) => {
            switch (a) {
                case "x":
                case "y": return () => this.p[a];
                case "time": return () => (model.timer.dt * this.itr) % this.graph.t;
                default: break;
            };
        };
        const g = this.graph = Object.assign({
            x:0 ,y:0, t:2, nod:true,
            xaxis:{title:`${this.xval}`,grid:true,origin:true},
            yaxis:{title:`${this.yval}`,grid:true,origin:true},
            funcs:[],fading:0.3
        },this);
        g.funcs.addInterval = function(d) { this.push(d); return d };
        this.data = g.funcs.addInterval({data:[]}).data;
        this.itr = 0;
        this.xvalue = getValue(this.xval);
        this.yvalue = getValue(this.yval);
        if(this.graph.nod) {
            Object.setPrototypeOf(g, g2.prototype.chart.prototype);
            this.graph.xAxis = g.autoAxis(this.xvalue(),this.xvalue(),0,g.b);
            this.graph.yAxis = g.autoAxis(this.yvalue(),this.yvalue(),0,g.h);
        }
    },
    g2() {
        const g = this.graph;
        const x = this.xvalue();
        const y = this.yvalue();
        if      (g.xmin > x) g.xmin=x;
        else if (g.xmax < x) g.xmax=x;
        if      (g.ymin > y) g.ymin=y;
        else if (g.ymax < y) g.ymax=y;
        this.data.push(this.xvalue(),this.yvalue());
        if (++this.itr >= g.t / model.timer.dt) {
            this.itr = 0;
            if (typeof g.fading === "number") {
                for(let idx = g.funcs.length-1; idx >= 0; --idx) {
                    const fade = 255 * (1 - ((g.funcs.length-idx)*g.fading));
                    g.funcs[idx].color = g.funcs[idx].color.substr(0,7) + (fade < 16 ? "00" : (Math.floor(fade).toString(16)));
                }
            }
            this.data = g.funcs.addInterval({data:[]}).data;
        };
        return g2()
            .chart(g)
            .ins(g => {
                this.graph.nod && g.nod(this.graph.pntOf({x: this.xvalue(), y: this.yvalue()}))
            });
    }
}
