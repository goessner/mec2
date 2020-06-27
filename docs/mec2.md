

_mec2_ comes with a [custom HTML element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)
which allows to implement models directly into the page without the necessity of running extra boilerplate code.

The aim of this HTML element is to minimize the implementation overhead of the user,
while maintaining all features _mec2_ has.

```html
<mec-2 width="351" height="221" x0="60" y0="60" cartesian darkmode nodelabels nodeinfo="pos" constraintinfo>
{   "nodes":[
        {"id":"A0","base":true,"idloc":"sw"},
        {"id":"B0","x":100,"base":true,"idloc":"se"},
        {"id":"A","y":50,"idloc":"nw"},
        {"id":"B","x":120,"y":100,"idloc":"ne"}
    ],
    "constraints":[{
            "id":"a","p1":"A0","p2":"A","len":{"type":"const"},
            "ori":{"type":"drive","func":"linear","Dt":5},
            "lw":16, "ls":"#ff770066"
        }, {
            "id":"b","p1":"A","p2":"B","len":{"type":"const"},
            "lw":16, "ls":"#ff770066"
        }, {
            "id":"c","p1":"B0","p2":"B","len":{"type":"const"},
            "lw":16, "ls":"#ff770066"
        }
    ]
}
</mec-2>
<script src="https://cdn.jsdelivr.net/gh/goessner/mec2@master/mec2.html.js"></script>
```

<mec-2 width="351" height="221" x0="60" y0="60" cartesian darkmode nodelabels nodeinfo="pos" constraintinfo>
{   "nodes":[
        {"id":"A0","base":true,"idloc":"sw"},
        {"id":"B0","x":100,"base":true,"idloc":"se"},
        {"id":"A","y":50,"idloc":"nw"},
        {"id":"B","x":120,"y":100,"idloc":"ne"}
    ],
    "constraints":[
        {"id":"a","p1":"A0","p2":"A","len":{"type":"const"},"ori":{"type":"drive","func":"linear","Dt":5},"lw":16, "ls":"#ff770066"},
        {"id":"b","p1":"A","p2":"B","len":{"type":"const"},"lw":16, "ls":"#ff770066"},
        {"id":"c","p1":"B0","p2":"B","len":{"type":"const"},"lw":16, "ls":"#ff770066"}
    ]
}
</mec-2>
<script src="https://cdn.jsdelivr.net/gh/goessner/mec2@master/mec2.html.js"></script>

The overall styling is handled by respective properties of the `mec-2` element:

- `width`: Width of the element in `px`.
- `height`: Height of the element in `px`.
- `x0`: x-origin of the model.
- `y0`: y-origin of the model.
- `cartesian:`: Whether `cartesian` is true or not (see [View](https://goessner.github.io/g2/View.html)).
- `grid`: Show `grid` in background.
- `darkmode`: Whether dark mode is set or not.
- `gravity`: Activate gravity.
- `pausing`: Pause the model.
- `hidenodes`: Hide nodes.
- `constraintlabels`: Show labels of constraints.
- `loadlabels`: Show labels of loads.
- `nodelabels`: Show labels of nodes.

The syntax of the `innerHTML` is as straight forward as `mec2` is:
The model embedded into the `innerHTML` of the element is the same as they are
defined in the default way, but as `JSON`.

> **Note**: Don't forget to use quotations (e.g. `"x"`) for the properties,
> since the `g2-element` interprets the `innerHTML` using the
> [**JSON**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)
> format.

You can issue `asJSON` on any model designed in the "normal" way to get the JSON
description of said model.