# Easy-Brush

Easy-Brush is a brush engine developed on the JavaScript platform. The line segments are entirely composed of points, and interpolation algorithms are used to supplement the gaps between frame intervals. In the mode composed entirely of points, smooth and symmetrical Bezier curves can be achieved.

## Features

- Smooth Bezier curves
- lines entirely composed of points
- Good performance optimization

## Installation

Include the Easy-Brush script in your Project:

```shell
npm install easy-brush
```

Import the library in your JavaScript file:

```javascript
import { Brush } from 'easy-brush';
```

## Usage

```javascript
const canvas = document.getElementById('yourCanvasId');
const brushConfig = {
    color: "#000000",
    size: 8,
    flow: 0.8,
    opacity: 0.5,
    spacing: 0.15,
    roundness: 1.00,
    angle: 0.00,
}
const brush = new Brush(canvas);
brush.bindConfig(brushConfig)

let isStarted = false;

canvas.addEventListener('mousedown', (e) => {
    isStarted = true;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isStarted) return
    // If a stylus device can transmit real pressure sensing data. They can usually be obtained during events (e)
    const pressure = 0.5
    brush.putPoint(e.offsetX, e.offsetY, pressure)
    brush.render()
});

canvas.addEventListener('mouseup', () => {
    isStarted = false;
    brush.finalizeStroke()
});
```

Because the bindConfig function is used, you can directly modify the external config to change the brush configuration, or you can directly access the brushconfig to modify it separately.

## Template
Default effect:

![Default effect](https://github.com/DQLean/Easy-Brush/blob/main/docs/1.png "Default effect")

Or change the config
```javascript
brushConfig.color = "#4dfffc"
brushConfig.roundness = 0.3
```

![Dense effect](https://github.com/DQLean/Easy-Brush/blob/main/docs/2.png "Dense effect")

Or Use Brush Image:
```javascript
// If the image is in URL format, there will be a loading time
const img = "image url" | HTMLImageElement | HTMLCanvasElement
// Please use PNG image with transparent background
brush.loadImage(img, (isSuc) => {
    console.log(isSuc, "brush image load end");
})
```
![Use Brush Image](https://github.com/DQLean/Easy-Brush/blob/main/docs/3.png "Use Brush Image")

This allows you to use images to replace circles as point shapes.

### Modules
#### Use Shape Dynamics
```javascript
import { DynamicShapeModule } from 'easy-brush';

const dynamicShapeConfig = {
    sizeJitter: 0.00,
    sizeJitterTrigger: "pressure",
    minDiameter: 0.00,
    angleJitter: 0.00,
    angleJitterTrigger: "none",
    roundJitter: 0.00,
    roundJitterTrigger: "none",
    minRoundness: 0.00,
}
const dynamicShapeModule = new DynamicShapeModule()
dynamicShapeModule.bindConfig(dynamicShapeConfig)
brush.useModule(dynamicShapeModule)
```

#### Use Transparency Dynamics
```javascript
import { DynamicTransparencyModule } from 'easy-brush';

const dynamicTransparencyConfig = {
    opacityJitter: 0.00,
    opacityJitterTrigger: "none",
    minOpacityJitter: 0.00,
    flowJitter: 0.00,
    flowJitterTrigger: "none",
    minFlowJitter: 0.00,
}
const dynamicTransparencyModule = new DynamicTransparencyModule()
dynamicTransparencyModule.bindConfig(dynamicTransparencyConfig)
brush.useModule(dynamicTransparencyModule)
```

#### Use Spread
```javascript
import { SpreadModule } from 'easy-brush';

const spreadConfig: SpreadBasicConfig = {
    spreadRange: 0.00,
    spreadTrigger: "none",
    count: 0,
    countJitter: 0.00,
    countJitterTrigger: "none",
}
const spreadModule = new SpreadModule()
spreadModule.bindConfig(spreadConfig)
brush.useModule(const spreadModule = new SpreadModule()
)
```

## License
This project is licensed under the MIT License.
