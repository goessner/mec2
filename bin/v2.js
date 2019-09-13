/**
 * @author Stefan Goessner (c) 2013-17
 * @license MIT Licence (MIT)
 */
/* jshint -W014 */
    function v2(x,y) {
        return v2._extend(typeof x === 'object' ? x : {x:x,y:y});
    }
    v2.zero  = Object.create(null, {x:{value:0, enumerable:true},y:{value:0, enumerable:true},r:{value:0},w:{value:0}})
    v2.xunit = Object.create(null, {x:{value:1, enumerable:true},y:{value:0, enumerable:true},r:{value:1},w:{value:0}})
    v2.yunit = Object.create(null, {x:{value:0, enumerable:true},y:{value:1, enumerable:true},r:{value:1},w:{value:Math.PI/2}})

    v2.sum = function(u,v) {
        return v2({
            x: u.x+v.x,
            y: u.y+v.y
        })
    }
    v2.dif = function(u,v) {
        return v2({
            x: u.x-v.x,
            y: u.y-v.y
        })
    }
    v2.scl = function(s,u) {
        return v2({
            x: u.x*s,
            y: u.y*s
        })
    }
    v2.unit = function(u) {
        return v2({r:1,w:u.w});
    }
    v2.dot = function(u,v) {   // ~u*v
        return u.x*v.x + u.y*v.y;
    }
    v2.skew = function(u,v) {   // ~u*v
        return u.x*v.y - u.y*v.x;
    }

    v2.fneg = function(q) {
        return v2({
            x: ()=>-q.x,
            y: ()=>-q.y
        })
    }

    v2.fsum = function(u,v) {
        return v2({
            x: ()=>u.x+v.x,
            y: ()=>u.y+v.y
        })
    }
    v2.fdif = function(u,v) {
        return v2({
            x: ()=>u.x-v.x,
            y: ()=>u.y-v.y
        })
    }
    v2.fsimtrf = function(b,s,t) {
        let sf = typeof s === 'function' ? s : (()=>s),
            tf = typeof t === 'function' ? t : (()=>t);
        return v2({
            x: ()=>b.x*sf()-b.y*tf(),
            y: ()=>b.y*sf()+b.x*tf() 
        });
    }

    v2.fcase4 = function(a,b,c,sgn) {
        sgn = sgn < 0 ? -1 : 1;
        if (a.r && b.r && c.r) {
            let cc  = ()=>c.r*c.r,
                lam = ()=>((a.r*a.r-b.r*b.r)/cc() + 1)/2,
                mu  = ()=> a.r > lam()*c.r ? sgn*Math.sqrt(a.r*a.r/cc()-lam()*lam()) : 0;
            a.w = v2.fsimtrf(c,lam,mu).wfnc;
            b.w = v2.fdif(a,c).wfnc;
        }
    }

    v2.plain = function(q) {
        return Object.create(null, {x:{value:q.x, enumerable:true},y:{value:q.y, enumerable:true}});
    }

    // internals ...
    v2._extend = function(q) {
        // make convenient getters from function pointers ..
        if ('x' in q && typeof q.x === 'function') Object.defineProperty(q, 'x', { get: q.x, enumerable:true, configurable:false });
        if ('y' in q && typeof q.y === 'function') Object.defineProperty(q, 'y', { get: q.y, enumerable:true, configurable:false });
        if ('r' in q && typeof q.r === 'function') Object.defineProperty(q, 'r', { get: q.r, enumerable:true, configurable:false });
        if ('w' in q && typeof q.w === 'function') Object.defineProperty(q, 'w', { get: q.w, enumerable:true, configurable:false });
        q.__proto__ = v2._proto;
        return q;
    }
    v2._assign = function(q,key,val) {
        if (typeof val === 'function') Object.defineProperty(q, key, { get: val, enumerable:true, configurable:false });
        else                           Object.defineProperty(q, key, { value: val, enumerable:true, writable:true, configurable:false });
    }
    v2._proto = {
        get x() { return this.ispolar ? this.r*Math.cos(this.w) : 0; },
        set x(q) { if (!this.ispolar) v2._assign(this,'x',q) },
        get y() { return this.ispolar ? this.r*Math.sin(this.w) : 0; },
        set y(q) { if (!this.ispolar) v2._assign(this,'y',q) },
        get r() { return this.iscartesian ? Math.hypot(this.x,this.y) : 0; },
        set r(q) { if (!this.iscartesian) v2._assign(this,'r',q) },
        get w() { return this.iscartesian ? Math.atan2(this.y,this.x) : 0; },
        set w(q) { if (!this.iscartesian) v2._assign(this,'w',q) },
        get xfnc() { return Object.getOwnPropertyDescriptor(this,'x') && Object.getOwnPropertyDescriptor(this,'x').get || (()=>this.x); },
        get yfnc() { return Object.getOwnPropertyDescriptor(this,'y') && Object.getOwnPropertyDescriptor(this,'y').get || (()=>this.y); },
        get rfnc() { return Object.getOwnPropertyDescriptor(this,'r') && Object.getOwnPropertyDescriptor(this,'r').get || (()=>this.r); },
        get wfnc() { return Object.getOwnPropertyDescriptor(this,'w') && Object.getOwnPropertyDescriptor(this,'w').get || (()=>this.w); },
        get ispolar() { return !!Object.getOwnPropertyDescriptor(this,'r') || !!Object.getOwnPropertyDescriptor(this,'w'); },
        get iscartesian() { return !!Object.getOwnPropertyDescriptor(this,'x') || !!Object.getOwnPropertyDescriptor(this,'y'); },
        toString: function() { return `{x:${this.x},y:${this.y},r:${this.r},w:${this.w}}`; },
        __proto__:null
    }

// use it with node.js ... ?
if (typeof module !== 'undefined') module.exports = v2f;