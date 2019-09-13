class MecSlider extends HTMLElement {
    static get observedAttributes() {
        return ['width','min','max','step','value','bubble'];
    }

    constructor() {
        super();
        this._root = this.attachShadow({ mode:'open' });
    }

    // html slider attributes 
    get width() { return +this.getAttribute("width") || 100 }
    get min() { return +this.getAttribute("min") || 0 }
    get max() { return +this.getAttribute("max") || 100 }
    get step() { return +this.getAttribute("step") || 1 }
    get value() { return +this.getAttribute('value') || 0; }
    set value(q) {
        q = this._nfrac > 0 ? q.toFixed(this._nfrac) : q;
        this.setAttribute('value',q);
        this._slider.setAttribute('value',this._slider.value = q);
        this._slider.value = q;
        this.dispatchEvent(new CustomEvent('input', { detail: q }));
    }

    // https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
    connectedCallback() { this.init(); }
    disconnectedCallback() { this.deinit(); }
    attributeChangedCallback(name, oldval, val) {}

    init() {
        this.bubble = this.hasAttribute("bubble");
        this._root.innerHTML = MecSlider.template({
            id: this.id,
            width: this.width,
            height:this.height,
            min:this.min,
            max:this.max,
            step:this.step,
            value:this.value,
            darkmode:this.darkmode,
            bubble:this.bubble
        });
        // cache elements of shadow dom
        this._slider = this._root.querySelector('input');
        this._forbtn = this._root.querySelector('.forward');
        this._revbtn = this._root.querySelector('.reverse');
        // install instance specific function pointers from prototype methods ...
        this._sliderInputHdl  = this.sliderInput.bind(this);
        this._startForwardHdl = this.startForward.bind(this);
        this._startReverseHdl = this.startReverse.bind(this);
        this._endForwardHdl   = this.endForward.bind(this);
        this._endReverseHdl   = this.endReverse.bind(this);
        // install initial event listeners
        this._slider.addEventListener("input", this._sliderInputHdl, false);
        this._forbtn.addEventListener("pointerup", this._startForwardHdl, false);
        this._revbtn.addEventListener("pointerup", this._startReverseHdl, false);
        // cache instant specific values
        this._nfrac = Math.max(0,Math.ceil(-Math.log10(this.step)));  // number of digits after decimal point of step
        // init value bubble
        if (this.bubble) {
            this._bubble = this._root.getElementById('bubble');
            this._bubbleShowHdl = this.showBubble.bind(this);
            this._bubbleHideHdl = this.hideBubble.bind(this);

            this._slider.addEventListener("focusin", this._bubbleShowHdl, false);
            this._slider.addEventListener("focusout", this._bubbleHideHdl, false);
        }
    }
    deinit() { 
        // remove event listeners
        this._slider.removeEventListener("input", this.sliderInputHdl, false);
        this._forbtn.removeEventListener("pointerup", this._startForwardHdl, false);
        this._forbtn.removeEventListener("pointerup", this._endForwardHdl, false);
        this._revbtn.removeEventListener("pointerup", this._startReverseHdl, false);
        this._revbtn.removeEventListener("pointerup", this._endReverseHdl, false);
        if (this.bubble) {
            this._slider.removeEventListener("focusin", this._bubbleShowHdl, false);
            this._slider.removeEventListener("focusout", this._bubbleHideHdl, false);
        }
    // delete cached data
        delete this._bubble;
        delete this._slider;
        delete this._forbtn;
        delete this._revbtn;
    }

    sliderInput() {
        this.value = +this._slider.value;
        if (this._bubble)
            this.placeBubble();
    }
    showBubble() {
        this._bubble.style.display = 'block';
        this.placeBubble();
    }
    hideBubble() { 
        this._bubble.style.display = 'none';
    }
    placeBubble() {
        const thumbWidth = 12,  // width of thumb estimated .. depends on browser
              sliderBox = this._slider.getBoundingClientRect(),
              bubbleBox = this._bubble.getBoundingClientRect(),
              thumbLeft = Math.floor(sliderBox.left + thumbWidth/2),
              thumbRange = sliderBox.width - thumbWidth;
        this._bubble.style.left = Math.floor(thumbLeft - bubbleBox.width/2 + thumbRange*Math.max(0,Math.min(1,(this.value - this.min)/(this.max - this.min))))+'px';
        this._bubble.style.top = Math.floor(sliderBox.top - bubbleBox.height)+'px';
        this._bubble.innerHTML = this.getAttribute('value');
    }
    startForward() {
        if (this.value < this.max) {
            // change forward-button to stop-button
            this._forbtn.removeEventListener("pointerup", this._startForwardHdl, false);
            this._forbtn.innerHTML = MecSlider.stopsym;
            this._forbtn.addEventListener("pointerup", this._endForwardHdl, false);
            // deactivate reverse-button
            this._revbtn.removeEventListener("pointerup", this._startReverseHdl, false);
            this._revbtn.style.color = "#888";  // show disabled !
            // focus to slider ... disable it
            this._slider.focus();
            this._slider.setAttribute('disabled',true);
            this.showBubble();                  // needed for chrome !

            this.goFwd();
        }
    }
    endForward() {
        // change stop-button to forward-button
        this._forbtn.removeEventListener("pointerup", this._endForwardHdl, false);
        this._forbtn.innerHTML = MecSlider.fwdsym;
        this._forbtn.addEventListener("pointerup", this._startForwardHdl, false);
        // reactivate reverse-button
        this._revbtn.addEventListener("pointerup", this._startReverseHdl, false);
        this._revbtn.style.color = "inherit";
        // focus to slider ... enable it
        this._slider.focus();
        this._slider.removeAttribute('disabled');
        window.clearTimeout(this.timeoutId);
    }
    fwdStep() {
        let delta = this.value + this.step < this.max ? this.step : Math.max(this.max - this.value,0);
        if (delta) { // proceed ...
            this.value += delta;
            if (this._bubble)
                this.placeBubble();
        }
        else
            this.endForward();
        return !!delta;
    }
    goFwd() {
        // '.. loop with guarantee that the previous interval has completed before recursing.'
        // see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval
        this.timeoutId = window.setTimeout(() => {
            if (this.fwdStep())
                this.goFwd();
        }, 20);
    }
    startReverse() {
        if (this.value >= this.min) {
            // change reverse-button to stop-button
            this._revbtn.removeEventListener("pointerup", this._startReverseHdl, false);
            this._revbtn.innerHTML = MecSlider.stopsym;
            this._revbtn.addEventListener("pointerup", this._endReverseHdl, false);
            // deactivate forward-button
            this._forbtn.removeEventListener("pointerup", this._startForwardHdl, false);
            this._forbtn.style.color = "#888";  // show disabled !
            // focus to slider ... disable it
            this._slider.focus();
            this._slider.setAttribute('disabled',true);
            this.showBubble();                  // needed for chrome !

            this.goRev();
        }
    }
    endReverse() {
        // change stop-button to reverse-button
        this._revbtn.removeEventListener("pointerup", this._endReverseHdl, false);
        this._revbtn.innerHTML = MecSlider.revsym;
        this._revbtn.addEventListener("pointerup", this._startReverseHdl, false);
        // reactivate forward-button
        this._forbtn.addEventListener("pointerup", this._startForwardHdl, false);
        this._forbtn.style.color = "inherit";
        // focus to slider ... enable it
        this._slider.focus();
        this._slider.removeAttribute('disabled');

        window.clearTimeout(this.timeoutId);
    }
    revStep() {
        let delta = this.value - this.step >= this.min ? -this.step : -Math.max(this.min - this.value,0);
        if (delta) { // proceed ...
            this.value += delta;
            if (this._bubble)
                this.placeBubble();
        }
        else
            this.endReverse();
        return !!delta;
    }
    goRev() {
        // '.. loop with guarantee that the previous interval has completed before recursing.'
        // see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval
        this.timeoutId = window.setTimeout(() => {
            if (this.revStep())
                this.goRev();
        }, 20);
    }

    static template({id,width,min,max,step,value,bubble}) {
return `
<style>
   ::shadow {
       display:inline-flex; 
       width:${width}px; 
       align-items:center;
    }

    .slider {
       width: 100%; 
       font-size: 10pt;
    }

    input {
        min-width: calc(100% - 2.5em);
        margin: 0;
        padding: 0;
        vertical-align: middle;
    }

   .forward, .reverse {
       font-family: Consolas;
       font-size: 10pt;
       vertical-align: middle;
       cursor: default;
       user-select: none;
       -moz-user-select: none;
   }

   ${bubble?`
   #bubble {
        color: black;
        background-color: #f8f8f888;
        border: 1px solid #c8c8c8;
        border-radius: 2px 2px 10px 10px;
        font-family: Consolas;
        font-size: 10pt;
        text-align: center;
        padding: 2px;
        position: absolute;
        left: 0px;
        top: 0px;
        display: none;
        pointer-events:none`
   :''}
</style>
<div class="slider">
    <span class="reverse">${MecSlider.revsym}</span>
    <input type="range" min="${min}" max="${max}" value="${value}" step="${step}"/>
    <span class="forward">${MecSlider.fwdsym}</span>
    ${bubble?`<div id="bubble">?</div>`:''}
</div>`
}
}

MecSlider.fwdsym = '&#9655;'
MecSlider.revsym = '&#9665;'
MecSlider.stopsym = '&#9744;'

customElements.define('mec-slider', MecSlider);