/**
 * mec.drive (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 */
"use strict";

import { mec } from './mec.core';

/**
 * @namespace mec.drive namespace for drive types of the mec library.
 * They are named and implemented after VDI 2145 and web easing functions.
 */
mec.drive = {
    create({ func, z0, Dz, t0, Dt, t, bounce, repeat, args }) {
        const isin = (x, x1, x2) => x >= x1 && x < x2;
        let drv = func && func in mec.drive ? mec.drive[func] : mec.drive.linear,
            DtTotal = Dt;

        if (typeof drv === 'function') {
            drv = drv(args);
        }
        if (bounce && func !== 'static') {
            drv = mec.drive.bounce(drv);
            DtTotal *= 2;  // preserve duration while bouncing
        }
        if (repeat && func !== 'static') {
            drv = mec.drive.repeat(drv, repeat);
            DtTotal *= repeat;  // preserve duration per repetition
        }
        return {
            f: () => z0 + drv.f(Math.max(0, Math.min((t() - t0) / DtTotal, 1))) * Dz,
            ft: () => isin(t(), t0, t0 + DtTotal) ? drv.fd((t() - t0) / DtTotal) * Dz / Dt : 0,
            ftt: () => isin(t(), t0, t0 + DtTotal) ? drv.fdd((t() - t0) / DtTotal) * Dz / Dt / Dt : 0
        };
    },
    "const": {   // used for resting segments in a composite drive sequence.
        f: (q) => 0, fd: (q) => 0, fdd: (q) => 0
    },
    linear: {
        f: (q) => q, fd: (q) => 1, fdd: (q) => 0
    },
    quadratic: {
        f: (q) => q <= 0.5 ? 2 * q * q : -2 * q * q + 4 * q - 1,
        fd: (q) => q <= 0.5 ? 4 * q : -4 * q + 4,
        fdd: (q) => q <= 0.5 ? 4 : -4
    },
    harmonic: {
        f: (q) => (1 - Math.cos(Math.PI * q)) / 2,
        fd: (q) => Math.PI / 2 * Math.sin(Math.PI * q),
        fdd: (q) => Math.PI * Math.PI / 2 * Math.cos(Math.PI * q)
    },
    sinoid: {
        f: (q) => q - Math.sin(2 * Math.PI * q) / 2 / Math.PI,
        fd: (q) => 1 - Math.cos(2 * Math.PI * q),
        fdd: (q) => Math.sin(2 * Math.PI * q) * 2 * Math.PI
    },
    poly5: {
        f: (q) => (10 - 15 * q + 6 * q * q) * q * q * q,
        fd: (q) => (30 - 60 * q + 30 * q * q) * q * q,
        fdd: (q) => (60 - 180 * q + 120 * q * q) * q
    },
    static: {   // used for actuators (Stellantrieb) without velocities and accelerations
        f: (q) => q, fd: (q) => 0, fdd: (q) => 0
    },
    seq(segments) {
        let zmin = Number.POSITIVE_INFINITY,
            zmax = Number.NEGATIVE_INFINITY,
            z = 0, Dz = 0, Dt = 0,
            segof = (t) => {
                let tsum = 0, zsum = 0, dz;
                for (const seg of segments) {
                    dz = seg.dz || 0;
                    if (tsum <= t && t <= tsum + seg.dt) {
                        return {
                            f: zsum + mec.drive[seg.func].f((t - tsum) / seg.dt) * dz,
                            fd: mec.drive[seg.func].fd((t - tsum) / seg.dt) * dz / Dt,
                            fdd: mec.drive[seg.func].fdd((t - tsum) / seg.dt) * dz / Dt / Dt
                        }
                        tsum += seg.dt;
                        zsum += dz;
                    }
                    return {};  // error
                };

            for (const seg of segments) {
                if (typeof seg.func === 'string') { // add error logging here ..
                    Dt += seg.dt;
                    z += seg.dz || 0;
                    zmin = Math.min(z, zmin);
                    zmax = Math.max(z, zmax);
                }
            }
            Dz = zmax - zmin;
            //        console.log({Dt,Dz,zmin,zmax,segof:segof(0.5*Dt).f})
            return {
                f: (q) => (segof(q * Dt).f - zmin) / Dz,
                fd: (q) => segof(q * Dt).fd / Dz,
                fdd: (q) => 0
            }
        },
        // todo .. test valid velocity and acceleration signs with bouncing !!
        bounce(drv) {
            if (typeof drv === 'string') drv = mec.drive[drv];
            return {
                f: q => drv.f(q < 0.5 ? 2 * q : 2 - 2 * q),
                fd: q => drv.fd(q < 0.5 ? 2 * q : 2 - 2 * q) * (q < 0.5 ? 1 : -1),
                fdd: q => drv.fdd(q < 0.5 ? 2 * q : 2 - 2 * q) * (q < 0.5 ? 1 : -1)
            }
        }
        Dz = zmax - zmin;
        //        console.log({Dt,Dz,zmin,zmax,segof:segof(0.5*Dt).f})
        return {
            f: (q) => (segof(q * Dt).f - zmin) / Dz,
            fd: (q) => segof(q * Dt).fd / Dz,
            fdd: (q) => 0
        }
    },
    // todo .. test valid velocity and acceleration signs with bouncing !!
    bounce(drv) {
        if (typeof drv === 'string') drv = mec.drive[drv];
        return {
            f: q => drv.f(q < 0.5 ? 2 * q : 2 - 2 * q),
            fd: q => drv.fd(q < 0.5 ? 2 * q : 2 - 2 * q) * (q < 0.5 ? 1 : -1),
            fdd: q => drv.fdd(q < 0.5 ? 2 * q : 2 - 2 * q) * (q < 0.5 ? 1 : -1)
        }
    },
    repeat(drv, n) {
        if (typeof drv === 'string') drv = mec.drive[drv];
        return {
            f: q => drv.f((q * n) % 1),
            fd: q => drv.fd((q * n) % 1),
            fdd: q => drv.fdd((q * n) % 1)
        }
    },
    // Penner's' simple potential functions ... why are they so popular ?
    pot: [{ f: q => 1, fd: q => 0, fdd: q => 0 },
    { f: q => q, fd: q => 1, fdd: q => 0 },
    { f: q => q * q, fd: q => 2 * q, fdd: q => 2 },
    { f: q => q * q * q, fd: q => 3 * q * q, fdd: q => 6 * q },
    { f: q => q * q * q * q, fd: q => 4 * q * q * q, fdd: q => 12 * q * q },
    { f: q => q * q * q * q * q, fd: q => 5 * q * q * q * q, fdd: q => 20 * q * q * q }],

        inPot(n) { return this.pot[n]; },

    outPot(n) {
        const fn = this.pot[n];
        return {
            f: q => 1 - fn.f(1 - q),
            fd: q => fn.fd(1 - q),
            fdd: q => -fn.fdd(1 - q)
        }
    },

    inOutPot(n) {
        const fn = this.pot[n], exp2 = Math.pow(2, n - 1);
        return {
            f: q => q < 0.5 ? exp2 * fn.f(q) : 1 - exp2 * fn.f(1 - q),
            fd: q => q < 0.5 ? exp2 * fn.fd(q) : exp2 * fn.fd(1 - q),
            fdd: q => q < 0.5 ? exp2 * (n - 1) * fn.fdd(q) : -exp2 * (n - 1) * fn.fdd(1 - q)
        }
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

mec.model.prototype.addPlugIn('drives', mec.drive);
