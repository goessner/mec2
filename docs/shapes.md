---
"layout": "page",
"title": "mec2-shapes",
"header": "Shapes",
"date": "2020-06-09",
"description": "",
"permalink": "#",
"tags": []
---

### Shapes

It is possible to stylize elements with geometric forms or images.
Those `shapes` are only cosmetic and serve no functional purpose.

All `shapes` need a `p` or similar references node `id`s.


Predefined types for geometries are:
- `fix`: Marks a `node` as stationary. `w0` determines an angle. Default: 0.
- `flt`: Same as `fix`, but marks `node` as being movable translational.
- `slider`: Same as `flt`, but represents a movable slider.
- `bar`: Connect `node` `p1` and `node` `p2` using a bar.
- `beam`: Same as `bar`, but using only one `p`. Reference an angle of a constraint with `wref` and define the length of the beam with `len`.
- `wheel`: Draw a `wheel` on a `node`. `wref` a constraint for the angle.
- `poly`: Same as `beam`, but instead of a `beam`, a polygon is drawn using a `pts` array of coordinates.
- `img`: Import an image using [g2's image function](https://github.com/goessner/g2/wiki/Elements#images).

### Examples

```json
{
    "nodes": [
        { "id": "A0", "x": 75, "y": 125, "base": true },
        { "id": "A", "x": 100, "y": 175 },
        { "id": "B0", "x": 300, "y": 125 }
    ],
    "constraints": [
        {
          "id": "a", "p1": "A0", "p2": "A",
          "len": { "type": "const" },
          "ori": { "type": "drive", "repeat": 3 }
        }, {
          "id": "b", "p1": "B0", "p2": "A",
          "len": { "type": "const" }
        }, {
          "id": "c", "p1": "A0", "p2": "B0",
          "ori": { "type": "const" }
        }
    ],
    "shapes": [
        { "type": "fix", "p": "A0" },
        { "type": "flt", "p": "B0" }
    ]
}
```

<img src="img/shape_1.gif" width=600 alt="first">


<!-- TODO example with cool poly shapes. e.g. a dump truck -->
