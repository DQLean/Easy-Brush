# Easy-Brush

Easy-Brush is a JavaScript brush engine designed for drawing on HTML5 canvas elements. It offers smooth Bezier curves for a natural drawing experience.

## Features

- Smooth Bezier curves
- Customizable brush color and size
- Easy integration with canvas events

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
const config = {
    color: "#e00f0f",
    size: 38,
    flow: 0.7,
    opacity: 0.5,
    spacing: 0.8,
    roundness: 0.00,
    angle: 0.00,
}
const brush = new Brush(canvas, config);

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

You can freely change the configuration to achieve different brush effects.

If there are any changes midway, please use the **brush.loadConfig** function to load the configuration

## Template
Default effect:

![Default effect](https://github.com/DQLean/Easy-Brush/blob/main/docs/normal.png "Default effect")

Or change the spacing to become denser

![Dense effect](https://github.com/DQLean/Easy-Brush/blob/main/docs/normal_dense.png "Dense effect")

Or Use Brush Image:
```javascript
// If the image is in URL format, there will be a loading time
const img = "image url" | HTMLImageElement | HTMLCanvasElement
// Please use PNG image with transparent background
brush.loadImage(img, (isSuc) => {
    console.log(isSuc, "brush image load end");
})
```
![Use Brush Image](https://github.com/DQLean/Easy-Brush/blob/main/docs/use_image.png "Use Brush Image")

### Modules
#### Use Shape Dynamics
```javascript
import { DynamicShapeModule } from 'easy-brush';

brush.useModule(new DynamicShapeModule({
    sizeJitter: 1,
    sizeJitterTrigger: "none",
    minDiameter: 0.5,
    angleJitter: 1,
    angleJitterTrigger: "none",
    roundJitter: 0.00,
    roundJitterTrigger: "none",
    minRoundness: 0.00,
}))
```

![Use Dynamic Shape](https://github.com/DQLean/Easy-Brush/blob/main/docs/use_dynamic_shape_module.png "Use Dynamic Shape")

#### Use Transparency Dynamics
```javascript
import { DynamicTransparencyModule } from 'easy-brush';

brush.useModule(new DynamicTransparencyModule({
    opacityJitter: 0.5,
    opacityJitterTrigger: "none",
    minOpacityJitter: 0.00,
    flowJitter: 0.5,
    flowJitterTrigger: "none",
    minFlowJitter: 0.00,
}))
```

![Use Dynamic Transparency](https://github.com/DQLean/Easy-Brush/blob/main/docs/use_dynamic_transparency_module.png "Use Dynamic Transparency")

#### Use Spread
```javascript
import { DynamicSpreadModule } from 'easy-brush';

brush.useModule(new DynamicSpreadModule({
    spreadRange: 0.8,
    spreadTrigger: "none",
    count: 5,
    countJitter: 0.00,
    countJitterTrigger: "none",
}))
```

![Use Spread](https://github.com/DQLean/Easy-Brush/blob/main/docs/use_spread_module.png "Use Spread")

## License
This project is licensed under the MIT License.
