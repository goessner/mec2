class Mec2Element extends HTMLElement {
    static get observedAttributes() {
        return ['width', 'height','cartesian','grid', 'x0', 'y0', 
                'darkmode', 'gravity', 'hidenodes', 'hideconstraints', 
                'nodelabels', 'constraintlabels', 'loadlabels',
                'nodeinfo', 'constraintinfo'];
    }

    constructor() {
        super();
        this._root = this.attachShadow({ mode:'open' });
        this._state = { edit:false, pause:true };
        this._inputs = [];
    }

    get width() { return +this.getAttribute('width') || 301; }
    set width(q) { if (q) this.setAttribute('width',q); }
    get height() { return +this.getAttribute('height') || 201; }
    set height(q) { if (q) this.setAttribute('height',q); }
    get x0() { return (+this.getAttribute('x0')) || 0; }
    set x0(q) { if (q) this.setAttribute('x0',q); }
    get y0() { return (+this.getAttribute('y0')) || 0; }
    set y0(q) { if (q) this.setAttribute('y0',q); }
    get cartesian() { return this.hasAttribute('cartesian'); }
    set cartesian(q) { q ? this.setAttribute('cartesian','') : this.removeAttribute('cartesian'); }
    get grid() { return this.hasAttribute('grid') || false; }
    set grid(q) { q ? this.setAttribute('grid','') : this.removeAttribute('grid'); }

    get show() { return this._show; }

    get hasInputs() { return !!this._inputs.length; }
    get inputDriveCount() { return this._inputs.length; }

    get gravity() { return this._model.gravity.active; }
    set gravity(q) {
        this._gravbtn.innerHTML = q ? '&checkmark;g' : '&nbsp;&nbsp;g';
        this._model.gravity.active = q;
    }

    get pausing() { return this._state.pause; }
    set pausing(q) { 
        if (this._state.pause && !q) {  // start / continue running
            if (!this._model.isActive)
                this._model.reset();
            this._state.pause = false;
            this._model.sleepMinDelta = 1;
            if (this.editing)  // do not run in edit mode ... so toggle !
                this.editing = false;
            this._runbtn.innerHTML = '&#10074;&#10074;';
        }
        else if (!this._state.pause && q) {
            this._state.pause = true;
            this._runbtn.innerHTML = '&#9654;';
        }
    //  else  ... nothing to do
    }
/*
    get editing() { return this._state.edit; }
    set editing(q) { 
        if (!this._state.edit && q) {  // edit in initial pose only
            if (this.hasInputs)
                for (const input of this._inputs) {
                    const val0 = input.sub === 'ori' ? input.w0 : input.r0;
                    this._root.getElementById(input.id).value = val0;
//                    input.constraint[input.sub].inputCallbk(val0);  // necessary ?
                }
            this._model.reset();
            this._editbtn.innerHTML = 'drag';
            this._state.edit = true;
        }
        else if (this._state.edit && !q) {
            this._editbtn.innerHTML = 'edit';
            this._state.edit = false;
        }
    //  else  ... nothing to do
//        this.log(`editing=${this._state.edit}`)
    }
*/
    init() {
        // create model
        if (!this.parseModel(this.innerHTML)) return;
        // install 'show' environment ...
        this._show = Object.create(Object.getPrototypeOf(mec.show), Object.getOwnPropertyDescriptors(mec.show)); // copy defaults
        this._show.darkmode = this.getAttribute('darkmode') === "" ? true : false;  // boolean
        this._show.nodes = this.getAttribute('hidenodes') === "" ? false : true;  // boolean
        this._show.constraints = this.getAttribute('hideconstraints') === "" ? false : true;  // boolean
        this._show.nodeLabels = this.getAttribute('nodelabels') === "" ? true : false;  // boolean
        this._show.constraintLabels = this.getAttribute('constraintlabels') === "" ? true : false;  // boolean
        this._show.nodeInfo = this.hasAttribute('nodeinfo') && (this.getAttribute('nodeinfo') || 'id');  // string
        this._show.constraintInfo = this.hasAttribute('constraintinfo') && (this.getAttribute('constraintinfo') || 'id');  // string
        this._model = mec.model.extend(this._model, this);
        this._model.init();
        // find input-drives
        this._inputs = this._model.inputControlledDrives;
        // find charts
        this._charts = this._model.views.filter(v => v.as === 'chart')
        // add shadow dom
        this._root.innerHTML = Mec2Element.template({
            width: this.width,
            height: this.height,
            dof: this._model.dof,
            gravity: this._model.gravity.active,
            inputs: this._inputs,
            charts: this._charts,
            darkmode: this._show.darkmode
        });
        // cache elements of shadow dom
        this._ctx      = this._root.getElementById('cnv').getContext('2d');
        this._runbtn   = this._root.getElementById('runbtn');
        this._resetbtn = this._root.getElementById('resetbtn');
//        this._editbtn  = this._root.getElementById('editbtn');
        this._gravbtn  = this._root.getElementById('gravbtn');
        this._corview  = this._root.getElementById('corview');
        this._dofview  = this._root.getElementById('dofview');
//        this._egyview  = this._root.getElementById('egyview');
        this._fpsview  = this._root.getElementById('fpsview');
        this._itrview  = this._root.getElementById('itrview');
        this._info     = this._root.getElementById('info');
        this._logview  = this._root.getElementById('logview');
        // check gravity attribute
        this.gravity = this.getAttribute('gravity') === "" ? true : false;
        // add event listeners
        this._runbtnHdl   = e => this.pausing = !this.pausing; this._runbtn  .addEventListener("click", this._runbtnHdl, false);
        this._resetbtnHdl = e => this.reset();                 this._resetbtn.addEventListener("click", this._resetbtnHdl, false);
  //      this._resetbtnHdl = e => this.editing = !this.editing; this._editbtn .addEventListener("click", this._resetbtnHdl, false);
        this._gravbtnHdl  = e => this.gravity = !this.gravity; this._gravbtn .addEventListener("click", this._gravbtnHdl, false);
        // some more members
        this._interactor = canvasInteractor.create(this._ctx,{x:this.x0,y:this.y0,cartesian:this.cartesian});
        this._g = g2().clr().view(this._interactor.view);
        this._gusr = g2();
        if (this.grid) this._g.grid({color:this._show.darkmode?'#999':'#ccc'});
        this._selector = g2.selector(this._interactor.evt);
        // treat valid initial model
        if (this._model.valid) {
            // add input event listeners
            for (const input of this._inputs) {
                const z0 = input.sub === 'ori' ? input.w0 : input.r0;
                input.hdl = e => { 
                    if (this.editing) this.editing = false; 
                    input.constraint[input.sub].inputCallbk((+e.target.value-z0),false);
                    this.pausing = false;
                };
                this._root.getElementById(input.id).addEventListener("input", input.hdl, false);
            }
            this._model.preview();
            this._model.pose();
            this._model.draw(this._g);
            this._g.ins(this._gusr);
            this._g.exe(this._ctx);
            this._interactor.on('drag', e => this.ondrag(e))
                            .on('tick', e => this.ontick(e))
                            .on(['pointermove','pointerup'], e => this.showInfo(e))
                            .on('pointerdown', e => this.hideInfo(e))
//                            .on('pointerup', e => this.showInfo(e))
                            .startTimer();
            this.dispatchEvent(new CustomEvent('init'));
        }
        else if (this._model.msg) {
            this._g.exe(this._ctx);
            this.log(mec.messageString(this._model.msg));
        }
        this.pausing = true;  // initially ...
    }
    deinit() {
        delete this._g;
        delete this._gusr;
        delete this._model;    // we may need a model.deinit method perhaps
        delete this._selector;
        delete this._interactor.deinit();
        // find input-drives
        for (const input of this._inputs)
            this._root.getElementById(input.id).removeEventListener("input", input.hdl, false);
        delete this._inputs;
        delete this._charts;
        // remove event listeners
        this._runbtn  .removeEventListener("click", this._runbtnHdl, false);
        this._resetbtn.removeEventListener("click", this._resetbtnHdl, false);
//        this._editbtn .removeEventListener("click", this._resetbtnHdl, false);
        this._gravbtn .removeEventListener("click", this._gravbtnHdl, false);
        // delete cached data
        delete this._ctx;
        delete this._runbtn;
        delete this._resetbtn;
//        delete this._editbtn;
        delete this._gravbtn;
        delete this._corview;
        delete this._dofview;
//        delete this._egyview;
        delete this._fpsview;
        delete this._itrview;
        delete this._info;
        delete this._logview;
    }

    parseModel() {
        try { this._model = JSON.parse(this.innerHTML); return true; }
        catch(e) { this._root.innerHTML = e.message; }
        return false; 
    }

    reset() {
        this._model.reset();
        this._model.pose();
        this._g.exe(this._ctx);
        this.pausing = true;  // initially ...
    }
    showInfo(e) {
        const info = this._model.info;
        if (info) {
            const bbox = this._ctx.canvas.getBoundingClientRect();
            this._info.style.left = (bbox.left + e.x + 8).toFixed(0)+'px'; 
            this._info.style.top = this.cartesian 
                                 ? (bbox.top + this._ctx.canvas.height - e.y - 20).toFixed(0)+'px'
                                 : (bbox.top + e.y - 20).toFixed(0)+'px';
            this._info.innerHTML = info;
            this._info.style.display = 'inline';
        }
        else
            this._info.style.display = 'none';
    }
    hideInfo(e) {
        if (this._info.style.display === 'inline') {
            this._info.style.display = 'none';
        }
    }

    log(str) { 
        this._logview.innerHTML = str; 
    }

    ondrag(e) {
        if (this._selector.selection && this._selector.selection.drag) {
            this._selector.selection.drag({x:e.xusr,y:e.yusr,dx:e.dxusr,dy:e.dyusr,mode:this.editing?'edit':'drag'});
            this._model.preview();
            this._model.pose();
            this.dispatchEvent(new CustomEvent('drag'));
            this._g.exe(this._ctx);
            // this._state.edit ? this._model.reset() : this._model.pose();
        }
    }
    ontick(e) {
        if (!this.pausing && this._model.isActive) {
            if (this._selector.selection && !this.hasInputs)
                this.pausing = true;
            else {
                this._model.tick(1/60);
                this.dispatchEvent(new CustomEvent('tick'));
            }
        }
        if (this._model.isActive || this.editing || e.dirty) { // simulation is running ... or pointer is moving ...
            this._g.exe(this._selector);
            this._g.exe(this._ctx);
        }
        // avoid unnecessary model.tick's with mechanims fully controlled by inputs .. !  
        if (this.pausing === false &&
            this._model.activeDriveCount - this.inputDriveCount === 0 &&
            (this._model.dof === 0 || this._model.isSleeping))
            this.pausing = true;
//        this.log(`activeDrives=${this._model.activeDriveCount}, inputDrives=${this.inputDriveCount}, isSleeping=${this._model.isSleeping}, pausing=${this.pausing}, t=${this._model.timer.t}`)
        this._corview.innerHTML = this._interactor.evt.xusr.toFixed(0)+', '+this._interactor.evt.yusr.toFixed(0);
        this._fpsview.innerHTML = 'fps: '+canvasInteractor.fps;
//        this._egyview.innerHTML = 'E: '+(this._model.valid ? mec.to_J(this._model.energy).toFixed(2) : '-');
        this._itrview.innerHTML = this._model.state.itrpos+'/'+this._model.state.itrvel;
    }

    // standard lifecycle callbacks
    // https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
    connectedCallback() {
        this.init();
    }
    disconnectedCallback() {
        this.deinit();
    }
    attributeChangedCallback(name, oldval, val) {
        if (this._root && this._root.getElementById('cnv')) {
            if (name === 'width') {  // todo: preserve minimum width
                this._root.getElementById('cnv').setAttribute('width',val);
                this._root.querySelector('.status').style.width = val+'px';
            }
            if (name === 'height')   // todo: preserve minimum height
                this._root.getElementById('cnv').setAttribute('height',val);
        }
    }

    static template({width,height,darkmode,dof,gravity,inputs,charts}) {
return `
<style>
    nav {
        width: ${width-2}px;
        background-color:#555;
        color:#ddd;
        font-family:Arial;
        font-size: 10pt;
        display: grid;
        grid-gap: 1px;
        grid-template-columns: auto auto;
        padding: 2px;
        align-content: center;
        -moz-user-select: none;
        user-select: none;
        cursor:default;
    }
    .right {
        text-align: right;
        vertical-align: bottom;
    }
    nav > span > span:hover { color:#fff; }
    nav > span > output { display:inline-block; padding:0px 1px; margin:0px 0px; }
    #cnv {
        border:solid 1px ${darkmode?'#777':'#eee'}; 
        background-color:${darkmode?'#777':'#eee'};
        touch-action: none;
    }
</style>
<div style="width:${width};">
<nav>
  <span class="left">
    <svg style="margin-bottom:-5pt; padding-left: 5pt;" class="flex-shrink-0 mr-2" version="1.0" xmlns="http://www.w3.org/2000/svg" width="16pt" height="16pt" viewBox="0 0 512 512" preserveAspectRatio="xMidYMid meet">
    <g transform="translate(0,512) scale(0.1,-0.1)" fill="#ddd" stroke="none">
        <path d="M1300 4786 c-345 -47 -603 -160 -734 -322 -50 -61 -115 -188 -143
        -280 -24 -81 -23 -272 2 -369 58 -225 237 -425 380 -425 34 0 35 1 35 38 0 21
        -5 43 -12 50 -15 15 -50 124 -94 294 -64 251 -45 366 83 493 173 171 430 243
        823 232 286 -8 538 -52 845 -147 144 -44 205 -59 247 -60 32 0 40 4 54 33 9
        17 34 53 55 79 22 26 39 57 39 70 0 44 -58 80 -212 130 -274 90 -481 140 -728
        173 -156 22 -518 28 -640 11z" fill="orange"></path>
        <path d="M3217 4489 c-159 -37 -309 -189 -346 -350 -26 -111 -8 -266 41 -364
        27 -51 120 -148 172 -179 151 -89 371 -90 519 -3 95 56 191 188 216 298 13 57
        13 191 0 248 -37 163 -187 313 -350 350 -53 13 -199 12 -252 0z"></path>
        <path d="M2684 3899 c-31 -34 -183 -153 -261 -203 -139 -90 -328 -168 -520
        -216 -24 -6 -43 -16 -43 -21 0 -6 22 -36 50 -66 55 -60 106 -157 116 -221 4
        -27 12 -42 21 -42 8 0 51 31 96 69 202 169 431 285 685 346 39 9 72 22 72 27
        0 6 -20 33 -45 60 -50 56 -100 152 -110 213 -14 83 -25 93 -61 54z"></path>
        <path d="M3954 3813 c-9 -21 -29 -67 -45 -102 -16 -35 -29 -77 -29 -95 0 -34
        23 -64 174 -233 162 -180 257 -356 300 -550 20 -90 20 -139 0 -228 -9 -38 -20
        -90 -24 -115 -4 -25 -14 -65 -23 -90 -55 -159 -51 -190 19 -190 34 0 121 61
        167 117 44 53 101 167 129 257 25 81 34 232 19 336 -38 258 -212 556 -471 806
        -135 131 -189 153 -216 87z" fill="orange"></path>
        <path d="M3659 3474 c-70 -48 -144 -66 -286 -72 -97 -3 -133 -8 -133 -17 0 -7
        11 -37 24 -66 48 -110 125 -329 170 -484 88 -308 136 -618 162 -1052 7 -127
        10 -129 72 -88 77 51 146 68 300 73 78 2 142 8 142 11 0 4 -18 54 -41 112
        -208 529 -299 923 -331 1427 -13 203 -13 202 -79 156z"></path>
        <path d="M1297 3480 c-162 -41 -309 -190 -346 -351 -13 -57 -13 -191 0 -248
        17 -74 58 -149 116 -212 99 -106 202 -149 358 -149 156 0 264 46 364 156 86
        94 120 189 121 336 0 150 -44 253 -153 355 -93 86 -167 115 -312 119 -60 2
        -127 -1 -148 -6z"></path>
        <path d="M1110 2333 c0 -149 -21 -275 -71 -425 -21 -65 -39 -122 -39 -127 0
        -5 66 -11 148 -13 120 -4 158 -9 207 -27 33 -13 67 -25 76 -28 14 -4 15 15 15
        164 0 186 14 266 73 416 17 43 31 81 31 86 0 5 -64 11 -142 13 -115 4 -155 9
        -203 27 -105 40 -95 49 -95 -86z"></path>
        <path d="M978 1621 c-152 -49 -282 -189 -317 -342 -13 -57 -13 -191 0 -248 37
        -163 187 -313 350 -350 57 -13 191 -13 248 0 163 37 313 187 350 350 13 57 13
        191 0 248 -25 110 -121 242 -216 298 -110 64 -292 83 -415 44z"></path>
        <path d="M3828 1621 c-83 -27 -138 -62 -201 -130 -58 -63 -99 -138 -116 -212
        -13 -57 -13 -191 0 -248 37 -163 187 -313 350 -350 57 -13 191 -13 248 0 163
        37 313 187 350 350 13 57 13 191 0 248 -35 155 -166 294 -320 342 -81 25 -231
        25 -311 0z"></path>
    </g>
    </svg>
    <span>&nbsp;</span>
    <span id="runbtn" title="run/pause"${inputs.length ? ' disabled' : ''}>&#9654;</span>
    <span id="resetbtn" title="reset">&#8617;</span>
    <span id="gravbtn" title="gravity on/off">&nbsp;&nbsp;g</span>
  </span>
  <span class="right">
    <output id="corview" title="pointer cordinates" style="min-width:4.5em;">0,0</output>
    <output id="fpsview" title="frames per second" style="min-width:3em;"></output>
    <output id="dofview" title="degrees of freedom" style="min-width:2em;">dof: ${dof}</output>
    itr: <output id="itrview" title="pos/vel iterations" style="min-width:3.5em"></output>
  </span>
</nav>
<canvas id="cnv" width="${width}" height="${height}" touch-action="none"></canvas><br>
<span id="info" style="position:absolute;display:none;color:#222;background-color:#ffb;border:1px solid black;font:0.9em monospace;padding:0.1em;font-family:Courier;font-size:9pt;">tooltip</span>
${inputs.length ? inputs.map((input,i) => Mec2Element.slider({input,i,width})).join('') : ''}
${charts.length ? charts.map((chart, i) => Mec2Element.chart({chart, i})).join('') : ''}
<pre id="logview"></pre>
</div>
`
    }
    static slider({input,i,width,darkmode}) {
        const sub = input.sub, cstr = input.constraint;
        input.id = 'slider_'+i;
        if (sub === 'ori') {
            const w0 = Math.round(mec.toDeg(cstr.w0)), 
                  w1 = w0 + Math.round(mec.toDeg(cstr.ori.Dw || 2*Math.PI));
            input.w0 = w0;
            return `<mec-slider id="${input.id}" title="${input.constraint.id+'.ori'}" width="${width}" min="${w0}" max="${w1}" value="${w0}" step="2" bubble></mec-slider>`;
        }
        else { // if (sub === 'len')
            const r0 = cstr.r0, r1 = r0 + cstr.len.Dr;
            input.r0 = r0;
            return `<mec-slider id="${input.id}" title="${input.constraint.id+'.len'}" width="${width}" min="${r0}" max="${r1}" value="${r0}" step="1" bubble></mec-slider>`;
        }
    }
    static chart({chart, i}) {
        return `<mec-2-chart index=${i}></mec-2-chart>`
    }
}
customElements.define('mec-2', Mec2Element);
