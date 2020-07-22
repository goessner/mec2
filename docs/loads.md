---
"layout": "page",
"title": "mec2-Loads",
"header": "Loads",
"date": "2020-06-09",
"description": "",
"permalink": "#",
"tags": []
---

## Loads

* Load elements must have a `id` property of type string.
* Currently supported are load elements of `type` of `['force', 'spring']`.

### Force

* Forces are acting on nodes exclusively. The `p` property references a `node` by its `id`.
* The force value `value` must be a positive number greater than zero interpreted as [`N`]. Default is 1.
* Initial force orientation can be set by `w0` in [rad].
* Force orientation can be static or dynamic. In the dynamic case the orientation is referred to the orientation of a constraint specified by `wref` as a valid reference. `w0` is interpreted as an offset to the referenced constraint then.
* A drawing mode `mode` as one of `['push', 'pull']` specifies, how the force arrow is rendered. Default is `pull`.

#### Example:

```json
{
    "gravity": true,    
    "nodes": [       
        { "id": "A0", "x": 100, "y": 120, "base": true},
        { "id": "A",   "x": 200, "y": 120 }
    ],    
    "constraints": [
        { "id": "a", "p1": "A0", "p2": "A", "len": {"type": "const"}}
    ] ,
    "loads":[{
        "id":"F1","type":"force","p":"A",
        "value":30,"w0":1.5708,"mode":"push"
    }]
}
```

<img src="img/load_1.gif" width=600 alt="first">


### Spring

* Springs are acting between to nodes. They are required to have two valid references `p1` and `p2`, just like constraints.
* The spring rate `k` must be a positive number greater than zero interpreted as [`N/cm`]. Default value is `1`.
* Initial spring length of the unloaded spring can be set by `len0`. If not specified, the initial distance between `p1` and `p2` is taken.

#### Example:


```json
{   
    "nodes": [
        { "id": "A0","x":200,"y": 200, "base": true },
        { "id": "B0","x":100,"y": 100, "base": true },
        { "id": "A","x": 200, "y": 100 }
    ],
    "constraints": [
        {
            "id": "b","p1": "B0","p2": "A",
            "len": { "type": "const" }
        }
    ],
    "loads": [{
        "id": "a", "type" :"spring",
        "p1": "A0", "p2": "A", "k": 20
    }]
}
```

<img src="img/load_2.gif" width=600 alt="first">



#### Example:

```json
{  
    "gravity":true,
    "nodes": [
        { "id": "A0", "x": 175, "y": 50,"base": true },
        { "id": "B0", "x": 175, "y": 100,"base": true },
        { "id": "A", "x": 225, "y": 50 },
        { "id": "B", "x": 325, "y": 50 }
    ],
    "constraints": [
        { "id": "a", "p1": "A0", "p2": "A", "len":{"type":"const"}},
        { "id": "b", "p1": "A", "p2": "B", "len":  {"type": "const" },
          "ori": { "type": "const", "ref": "a" } }
    ],
    "loads": [
        {
            "id": "s", "type": "spring",
            "p1": "B0","p2":  "A","k": 78.695, "len0": 0 
        }
    ]
}
```

<img src="img/load_3.gif" width=600 alt="first">


