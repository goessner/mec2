class Mec2ChartElement extends HTMLElement {
    static get observedAttributes() {
        return [
            'width',
            'height',
            'show',
            'of',
            'canvas',
            'index', // index of the regarding chart (0 for the first chart in model)
            't0',
            'Dt',
            'x',
            'y',
            'b',
            'h',
            'mode',
            'ref' // TODO going to be "against"
        ];
    }

    constructor() {
        super();
        this._root = this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        if (this.parentElement &&
            this.parentElement.parentNode &&
            this.parentElement.parentNode.host) {
            this._ref = this.parentElement.parentNode.host;
            this._chart = this._ref._charts[this.index];
        }
        else {
            this._ref = document.getElementById(this.getAttribute('ref'));
            /**
             * If 'canvas' property is given, it will be searched for a chart to show.
             * Otherwise at least 'show' and 'of' have to be provided to the
             * html-element and it will integrate itself into the model.
             */
            if (this.getAttribute('canvas')) {
                // Like "viewById", but with "canvas" attribute instead
                const viewByCanvasId = (canvas) => {
                    for (const view of this._ref._model.views)
                        if (view.canvas === canvas)
                            return view;
                    return false;
                }
                this._chart = viewByCanvasId(this.getAttribute('canvas'));
            }
            else {
                const chart = {
                    show: this.getAttribute('show'),
                    of: this.getAttribute('of'),
                    mode: this.getAttribute('mode'),
                    as: 'chart'
                };
                this._ref._model.views.push(chart);
                mec.view.extend(chart);
                chart.init(this._ref._model);
                this._chart = this._ref._model.views[this._ref._model.views.length - 1];
            }
        }
        this._chart.graph.x = 35;
        this._chart.graph.y = 35;
        this._chart.graph.b = this.chartWidth;
        this._chart.graph.h = this.chartHeight;

        this._root.innerHTML = Mec2ChartElement.template({
            width: this.chartWidth, height: this.chartHeight
        });

        this._ctx = this._root.getElementById('cnv').getContext('2d');
        this._g = g2().del().clr().view({ cartesian: true });
        this._chart.draw(this._g);

        this.render();

        this._ref._interactor
            .on('drag', e => this.render())
            .on('tick', e => this.render());
    }

    render() {
        this._g.exe(this._ctx);
    }

    disconnectedCallback() {
        // TODO
    }
    get chartWidth() { return this.width + 50 }
    set chartWidth(q) { if (q) this.setAttribute('width', q) }
    get chartHeight() { return this.height + 50 }
    set chartHeight(q) { if (q) this.setAttribute('height', q) }

    get width() { return +this.getAttribute('width') || this._chart.graph.b || 150; }
    set width(q) { if (q) this.setAttribute('width', q); }
    get height() { return +this.getAttribute('height') || this._chart.graph.h || 100; }
    set height(q) { if (q) this.setAttribute('height', q); }

    get index() { return +this.getAttribute('index') }
    set index(q) { if (q) this.setAttribute('index', q) }

    get t0() { return +this.getAttribute('t0') || 0 }
    set t0(q) { if (q) this.setAttribute('t0', q) }
    get Dt() { return +this.getAttribute('Dt') || 1 }
    set Dt(q) { if (q) this.setAttribute('Dt', q) }
    get x() { return +this.getAttribute('x') }
    set x(q) { if (q) this.setAttribute('x', q) }
    get y() { return +this.getAttribute('y') }
    set y(q) { if (q) +this.setAttribute('y', q) }
    get b() { return +this.getAttribute('b') }
    set b(q) { if (q) +this.setAttribute('b', q) }
    get h() { return +this.getAttribute('h') }
    set h(q) { if (q) +this.setAttribute('h', q) }
    get mode() { return +this.getAttribute('mode') || 'static' }
    set mode(q) { if (q) +this.setAttribute('mode', q) }

    static template({ width, height }) {
        return `<canvas
        id='cnv' width=${width} height=${height}
        style="border:solid 1px black;"></canvas>`
    }
}
customElements.define('mec-2-chart', Mec2ChartElement);
