# Easy-Brush

Easy-Brush is a JavaScript-based brush engine that simplifies drawing on the web.

Easy-Brush can meet nearly all web drawing needs, whether it's for a signature pad or artwork. You can import only the modules you need or simply use the brush directly. Parameters can be controlled in real-time or set as fixed for specific brushes. In short, it allows you to achieve all your web drawing requirements with just a prepared canvas.

## Features

- Smooth and uniform Bézier curves
- Lines composed entirely of points
- Excellent performance optimization for the web

## Demo

This is an online demo project where you can preview the brush effects.

[Demo Online](https://dqlean.github.io/Easy-Brush-Demo/ "Demo Online")

## Installation

Install dependencies via npm:

```shell
npm install easy-brush
```

Import the dependency in your JavaScript file:

```javascript
import { Brush } from 'easy-brush';
```

## Usage

Below is the basic usage to draw on a canvas using a mouse or trackpad.

```javascript
// First, get your canvas element
const canvas = document.getElementById('yourCanvasId');
// Initialize brush configuration
const brushConfig = {
    color: "#000000", // Brush color
    size: 8, // Size
    flow: 0.8, // Flow
    opacity: 0.5, // Opacity
    spacing: 0.15, // Spacing
    roundness: 1.00, // Roundness
    angle: 0.00, // Angle
}
// Initialize the brush
const brush = new Brush(canvas);
// Bind the brush configuration to the brush instance (this way, modifying the external brushConfig will automatically update the brush internally)
brush.bindConfig(brushConfig)
// Or directly pass the configuration during initialization; this configuration is optional and won't be bound.
// const brush = new Brush(canvas, {
//     color: "#000000",
// })

// Variables for drawing control
let isStarted = false;
// Simulated pen pressure module (the faster the mouse moves, the lower the pressure; slower movement increases the pressure)
// const MP = new MousePressure()

// Add event listeners for mouse/touch events on the canvas
canvas.addEventListener('mousedown', (e) => {
    isStarted = true;
});
canvas.addEventListener('mousemove', (e) => {
    if (!isStarted) return
    // Default pressure value; for actual pen pressure, check the event (e) object (usually available only in stylus mode)
    const pressure = 0.5
    // Or use the simulated pen pressure module
    // const pressure = MP.getPressure(e.offsetX, e.offsetY)
    brush.putPoint(e.offsetX, e.offsetY, pressure)
    brush.render()
});

canvas.addEventListener('mouseup', () => {
    isStarted = false;
    // End the current stroke
    brush.finalizeStroke()
});
```

## Template

Default brush effect:

![Default effect](https://github.com/DQLean/Easy-Brush/blob/main/docs/1.png "Default effect")

You can try modifying the brush configuration to achieve different effects:
```javascript
brushConfig.color = "#4dfffc"
brushConfig.roundness = 0.3
```

![Dense effect](https://github.com/DQLean/Easy-Brush/blob/main/docs/2.png "Change config")

You can also use an image as the brush shape, replacing the default circular shape:
```javascript
// If the image is a URL, loading may take some time
const img = "image url" | HTMLImageElement | HTMLCanvasElement
// Use a PNG image with a transparent background; the non-transparent parts will be used as the brush shape
brush.loadImage(img, (isSuc) => {
    console.log(isSuc, "brush image load end");
})
```
![Use Brush Image](https://github.com/DQLean/Easy-Brush/blob/main/docs/3.png "Use Brush Image")

### Modules

Modules can enhance brush effects. You can control dynamic parameters of the brush by binding configurations.
```javascript
const moduleId = brush.useModule(Module) // Bind a module
brush.removeModule(moduleId) // Remove a module
```

#### Use Shape Dynamics

Shape dynamics control jitter for size, angle, and roundness. You can control dynamic parameters by binding configurations.
```javascript
import { DynamicShapeModule } from 'easy-brush';

const dynamicShapeConfig = {
    sizeJitter: 0.00, // Brush size jitter
    sizeJitterTrigger: "pressure", // Brush size jitter trigger (pressure: pen pressure, none: random)
    minDiameter: 0.00, // Minimum brush size
    angleJitter: 0.00, // Brush angle jitter
    angleJitterTrigger: "none", // Brush angle jitter trigger (pressure: pen pressure, none: random)
    roundJitter: 0.00, // Brush roundness jitter
    roundJitterTrigger: "none", // Brush roundness jitter trigger (pressure: pen pressure, none: random)
    minRoundness: 0.00, // Minimum brush roundness
}
const dynamicShapeModule = new DynamicShapeModule()
dynamicShapeModule.bindConfig(dynamicShapeConfig)
brush.useModule(dynamicShapeModule)
```

![DynamicShapeModule](https://github.com/DQLean/Easy-Brush/blob/main/docs/4.png "DynamicShapeModule")

#### Use Transparency Dynamics

Transparency dynamics control jitter for opacity and flow. You can control dynamic parameters by binding configurations.
```javascript
import { DynamicTransparencyModule } from 'easy-brush';

const dynamicTransparencyConfig = {
    opacityJitter: 0.00, // Brush opacity jitter
    opacityJitterTrigger: "none", // Brush opacity jitter trigger (pressure: pen pressure, none: random)
    minOpacityJitter: 0.00, // Minimum brush opacity
    flowJitter: 0.00, // Brush flow jitter
    flowJitterTrigger: "none", // Brush flow jitter trigger (pressure: pen pressure, none: random)
    minFlowJitter: 0.00, // Minimum brush flow
}
const dynamicTransparencyModule = new DynamicTransparencyModule()
dynamicTransparencyModule.bindConfig(dynamicTransparencyConfig)
brush.useModule(dynamicTransparencyModule)
```

![DynamicTransparencyModule](https://github.com/DQLean/Easy-Brush/blob/main/docs/5.png "DynamicTransparencyModule")

#### Use Spread

The Spread module controls the scattering of the brush. You can control dynamic parameters by binding configurations.
```javascript
import { SpreadModule } from 'easy-brush';

const spreadConfig: SpreadBasicConfig = {
    spreadRange: 0.00, // Brush scatter range
    spreadTrigger: "none", // Brush scatter trigger (pressure: pen pressure, none: random)
    count: 0, // Number of scatter points
    countJitter: 0.00, // Jitter for scatter count
    countJitterTrigger: "none", // Scatter count jitter trigger (pressure: pen pressure, none: random)
}
const spreadModule = new SpreadModule()
spreadModule.bindConfig(spreadConfig)
brush.useModule(spreadModule)
```

![SpreadModule](https://github.com/DQLean/Easy-Brush/blob/main/docs/6.png "SpreadModule")

#### Use Pattern (Beta)

The Pattern module controls brush textures. You can control dynamic parameters by binding configurations.
```javascript
import { PatternModule } from 'easy-brush';
const patternModule = new PatternModule(PatternImg, canvas.width, canvas.height)
brush.useModule(patternModule)
```

![Pattern](https://github.com/DQLean/Easy-Brush/blob/main/docs/7.png "Pattern")

## License

This project is licensed under the MIT License.
