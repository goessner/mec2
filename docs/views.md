---
"layout": "page",
"title": "mec2-views",
"header": "Views",
"date": "2020-06-09",
"description": "",
"permalink": "#",
"tags": []
---

## Views

Views can be used to make different properties of the model or single elements of the model visible.

They are implemented, similar to `nodes` and `constraints`, by creating a `views` array and describing single `views` as objects.

At the moment there are five different views available:
- `point` - to show the node position, the center of gravity, the inflection pole, the instance center velocity and the instance center of acceleration
- `vector` - to show a vector with a conforming orientation and length.
- `trace` - to show the movement of a point.
- `info` - to show an info cart.
- `chart` - to show coherences between different entities.

Each of these views is defined by the following properties:
- `show` - Which property is to be shown.
- `of` - The `id` of the respective element.
- `as` - Which type of `view` is to be used.
- `t0` - An offset to the `model.timer` for the `view`.
- `Dt` - Time interval of the view to be active.

### Example

```json
{
    "nodes": [
        { "id": "A0", "x": 75, "y": 50, "base": true },
        { "id": "A", "x": 75, "y": 100 },
        { "id": "B", "x": 275, "y": 170 },
        { "id": "B0", "x": 275, "y": 50, "base": true },
        { "id": "C", "x": 125, "y": 175 }
    ],
    "constraints": [
        {
            "id": "a", "p1": "A0", "p2": "A", "len": { "type":"const" },
            "ori": { "type": "drive", "Dt": 2, "Dw": 6.28 }
        }, {
            "id": "b", "p1": "A", "p2": "B", "len": { "type":"const" }
        }, {
            "id": "c", "p1": "B0", "p2": "B", "len": { "type":"const" }
        }, {
            "id": "d", "p1": "B", "p2": "C", "len": { "type":"const" },
            "ori": { "ref": "b", "type": "const" }
        }
    ],
    "views": [
        {
            "show": "pos", "of": "C", "as": "trace", "Dt":2.1,
            "mode":"preview", "fill":"orange"
        }, {
            "show": "vel", "of": "C", "as": "vector"
        }, {
            "as": "chart", "x": 340, "y": 75, "Dt": 1.9,
            "show": "wt", "of": "b"
        }
    ]
}
```

<img src="img/view_1.gif" width=600 alt="first">


```json
{
    "nodes": [
        { "id": "A0", "x": 100, "y": 50, "base": true, "idloc": "s" },
        { "id": "B0", "x": 200, "y": 50, "base": true, "idloc": "s" },
        { "id": "A", "x": 175, "y": 150, "idloc": "ne" },
        { "id": "B", "x": 125, "y": 150, "idloc": "nw" }
    ],
    "constraints": [
        { "id": "a", "p1": "A0", "p2": "A", "len": { "type": "const" } },
        { "id": "b", "p1": "A", "p2": "B", "len": { "type": "const" },
          "ori": { "type": "drive", "func": "linear", "Dt": 5, "repeat": 2 } },
        { "id": "c", "p1": "B0", "p2": "B", "len": { "type": "const" } }
    ],
    "views": [
        { "show": "pole", "of": "b", "as": "trace",
          "mode": "static", "t0": 0.02, "Dt": 9.98, "fill": "#90ee9088" },
        { "show": "pole", "of": "b", "ref": "b", "as": "trace",
          "mode": "static", "t0": 0.02, "Dt": 9.98, "fill": "#eeeeee88" }
    ]
}
```

<img src="img/view_2.gif" width=600 alt="first">


```json
{
    "nodes": [
        { "id": "A0", "x": 50, "y": 200, "base" :true },
        { "id": "A", "x": 150, "y": 200 },
        { "id": "B0", "x": 150, "y": 140, "base": true },
        { "id": "B", "x": 200, "y": 140 }
    ],
    "constraints": [
        {
            "id": "a", "p1": "A0", "p2": "A", "len": { "type": "const" },
            "ori": { "type": "drive", "func": "seq", "Dt":5, "Dw":0.5326,
                "repeat": 2, "args": [
                    { "func": "quadratic", "dt": 3, "dz": 2},
                    { "func": "const", "dt": 2 },
                    { "func": "quadratic", "dt": 3, "dz": -2}
                ]
            }
        },
        {
            "id": "b", "p1": "B0", "p2": "B", "len": { "type": "const" },
            "ori": { "type": "drive", "Dt": 5, "repeat": 2 }
        }
    ],
    "views": [{
        "show": "pos", "of": "A", "as": "trace", "ref": "b",
        "mode": "preview", "Dt": 5, "fill": "#ddd"
    }]
}
```

<img src="img/view_3.gif" width=600 alt="first">

