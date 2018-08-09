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
