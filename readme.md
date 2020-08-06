
# mec2

mec2 is a 2D physics simulation engine written in JavaScript.
It is designed to easily create 2D mechanisms for rapid sketching and rendering
the resulting models in a 2D canvas using [g2](github.com/goessner/g2).

Please have a loot at the documentation [here](https://goessner.github.io/mec2).

## Main features

- Fast and lightweight physics simulation.
- Addressing HTML canvas 2D using g2.
- Highly modifiable environment.
- High level definitions.
- Easy extensibility.
- No dependencies (beside g2 for rendering).
- Models may be easily exported, as they are provided as JSON.

## Minimal Example

```html
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
![mech](img/view_1.gif)

## License

mec2 is licensed under the terms of the MIT License.

