---
"layout": "page",
"title": "mec2-drive",
"header": "Drive",
"date": "2020-06-09",
"description": "",
"uses": [ { "uri": "navigation.md" } ],
"permalink": "#",
"tags": []
---

## Drives

The `type` of a constraint describes the interactions of two nodes.
Using only the `core` module the `type` can be set as `free` or `const` to allow or disallow motion respectively.
`mec2.drive` allows this `type` to be set as `drive` as well.
A constraint of `type` drive has a determined motion, which allows linkages with one degree of freedom to be fully determined.

Further properties can be provided to describe the motion (all angles in radiant):

- `func`: The function used to describe the motions. Default is `linear`. A lot of other functions are implemented after **VDI 2145**, as well as web easing functions.
- `ref`: Use the angle of another constraints as reference.
- `Dw`: Angle of rotation. Default: `2 * Math.PI`.
- `t0`: Time in milliseconds when to start the drive, after model initialization.
- `Dt`: Time needed for one turn.
- `bounce`: Perform a reversed motion after each interval (`bounce` is issued between repetitions).
- `repeat`: Repeat the motion this many times.
- `args`: Arguments for sequential functions. Implemented in the second example.

Using combinations of these properties a variety of motions can be described.

#### Example:

```json
{
    "nodes": [
        {
            "id":"A0", "x": 200, "y": 40, "base": true
        }, {
            "id":"A", "x": 200, "y": 140
        }
    ],
    "constraints": [
        {
            "id":"a","p1":"A0","p2":"A",
            "len":{"type":"const"},
            "ori":{"type":"drive","repeat":10,"Dt":3 }
        }
    ]
}  
```

<img src="img/drive_1.gif" width=600 alt="first">


`- Drive Sequence`

Drive functions can be composed as a sequence (`'func':'seq'`) of normalized functions, being one of `['const', 'linear', 'quadratic', 'harmonic', 'sinoid', 'poly5']` each. Every segment of a drive sequence must specify its function type `func`, its duration `dt` (always positive) and its value range `dz` (might be negative).

```json
{
    "nodes": [
        {"id":"A0","x":175,"y":125,"base":true},
        {"id":"A1","x":175,"y":225}
    ],
    "constraints": [
        { "id": "a", "p1": "A0", "p2": "A1",
          "len": { "type": "const" },
          "ori": { "type": "drive", 
          "Dt": 3, "Dw": -3.14, "repeat":2,
          "func": "seq", "args": [
            { "func": "quadratic", "dt": 3, "dz": 1 },
            { "func": "const", "dt": 1 },
            {"func": "linear", "dt": 3, "dz": -1 }]
        }
    }]
}
```
<img src="img/drive_2.gif" width=600 alt="first">


```json
{
    "nodes":[
        { "id": "A0", "x": 100, "y": 125, "base": true },
        { "id": "B", "x": 175, "y": 125 },
        { "id": "B0", "x": 250, "y": 125,"base": true },
        { "id": "A", "x": 175, "y": 125 }
    ],
    "constraints":[
        { "id": "b", "p1": "B0", "p2": "A",
          "len": { "type": "const" },
          "ori": { "type": "drive", "repeat":3 }
        },
        { "id": "c", "p1": "A0", "p2": "B",
          "len": {"type": "const" },
          "ori": { "type": "const", "ref":"b"}
        }
    ]
}
```

<img src="img/drive_3.gif" width=600 alt="first">

