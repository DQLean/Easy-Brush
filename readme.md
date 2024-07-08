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
const brush = new Brush(canvas, {
    color: "#900f0f",
    size: 4
});

let isStarted = false;

canvas.addEventListener('mousedown', (e) => {
    isStarted = true;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isStarted) return
    brush.putPoint(e.offsetX, e.offsetY, 0.5)
    brush.render()
});

canvas.addEventListener('mouseup', () => {
    isStarted = false;
    brush.finalizeStroke()
});
```

## License
This project is licensed under the MIT License.
