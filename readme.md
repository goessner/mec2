
# mec2

*mec2* is a javascript library for simulating and analysing planar mechanisms like linkages. The concept is based on *nodes* constrained by one of four different vectors. Solving the kinematic equations is done by using Erin Cattos principle of [sequential impulses](http://box2d.org/downloads/), often used by gaming physics engines.

Its API is minimal and easy to understand. The library is tiny and fast. Mechanisms are described using a simple JSON format.

## Example

![first](./img/4bar.gif)

## JSON

```js
{
    id: '4bar',
    nodes: [
        {id:'A0',x:100,y:100,base:true},
        {id:'A',x:100,y:150},
        {id:'B',x:350,y:220},
        {id:'B0',x:300,y:100,base:true},
    ],
    constraints: [
        { id:'a',p1:'A0',p2:'A',len:{type:'const'} },
        { id:'b',p1:'A', p2:'B',len:{type:'const'} },
        { id:'c',p1:'B0', p2:'B',len:{type:'const'} },
    ]
}
```

## Documentation

- todo -

# License
*mec2* is licensed under the terms of the MIT License.

# Change Log

### 0.7.0 - 2018-08-05

* first commit.
