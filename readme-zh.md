# Easy-Brush

Easy-Brush 是一个基于 JavaScript 的笔刷引擎，使绘画在web上更简单。

Easy-Brush可以完成几乎所有在web上绘制的需求，无论是签字版还是绘画，你可以按需引入你需要的模块，也可以简单地使用笔刷。可以实时控制它们的参数，也可以设计一个固定参数的笔刷。总之它可以实现你在web上的所有绘制需求，仅仅只需要准备一个canvas。

## Features

- 圆滑且匀称的贝塞尔曲线
- 完全由点构成的线条
- 良好的web性能优化

## Demo
这是一个线上的Demo工程，你可以在上面简单预览笔刷效果

[Demo Online](https://dqlean.github.io/Easy-Brush-Demo/ "Demo Online")


## Installation

通过npm安装依赖:

```shell
npm install easy-brush
```

在js中导入依赖:

```javascript
import { Brush } from 'easy-brush';
```

## Usage

这里介绍最基础的用法，使用鼠标或触摸板在canvas上绘制。

```javascript
// 首先需要获取你的canvas
const canvas = document.getElementById('yourCanvasId');
// 初始化笔刷配置
const brushConfig = {
    color: "#000000", // 笔刷颜色
    size: 8, // 大小
    flow: 0.8, // 流量
    opacity: 0.5, // 透明度
    spacing: 0.15, // 间距
    roundness: 1.00, // 圆度
    angle: 0.00, // 角度
}
// 初始化笔刷
const brush = new Brush(canvas);
// 将笔刷配置绑定到笔刷上 (这样做你只需要修改外部brushConfig，笔刷内部会自动响应)
brush.bindConfig(brushConfig)
// 或者直接在初始化时传入配置，这时的配置为可选配置，并且不会绑定
// const brush = new Brush(canvas, {
//     color: "#000000",
// })

// 绘制变量控制
let isStarted = false;
// 笔压模拟模块 (鼠标移动越快，笔压越小，反之笔压越大)
// const MP = new MousePressure()

// 添加canvas 鼠标/触摸 监听事件
canvas.addEventListener('mousedown', (e) => {
    isStarted = true;
});
canvas.addEventListener('mousemove', (e) => {
    if (!isStarted) return
    // 这里的pressure为默认pressure，如果你需要真实笔压值，可以在e(event)中找到笔压值参数，这通常仅在手写笔模式下存在
    const pressure = 0.5
    // 或者你可以使用笔压模拟模块
    // const pressure = MP.getPressure(e.offsetX, e.offsetY)
    brush.putPoint(e.offsetX, e.offsetY, pressure)
    brush.render()
});

canvas.addEventListener('mouseup', () => {
    isStarted = false;
    // 结束笔画单笔运行
    brush.finalizeStroke()
});
```

## Template
笔刷默认效果:

![Default effect](https://github.com/DQLean/Easy-Brush/blob/main/docs/1.png "Default effect")

你可以尝试改变笔刷配置，实现不同效果的笔刷
```javascript
brushConfig.color = "#4dfffc"
brushConfig.roundness = 0.3
```

![Dense effect](https://github.com/DQLean/Easy-Brush/blob/main/docs/2.png "Change config")

你还可以为笔刷添加图片，使用图片替代默认的圆形作为笔刷形状:
```javascript
// 如果图片为链接形式，加载可能需要一点时间
const img = "image url" | HTMLImageElement | HTMLCanvasElement
// 请使用透明背景的png图片，图片非透明部分会作为笔刷形状使用
brush.loadImage(img, (isSuc) => {
    console.log(isSuc, "brush image load end");
})
```
![Use Brush Image](https://github.com/DQLean/Easy-Brush/blob/main/docs/3.png "Use Brush Image")

### Modules

使用模块可以增加笔刷的效果，你可以通过绑定配置来控制笔刷的动态参数。
```javascript
const moduleId = brush.useModule(Module) // 绑定模块
brush.removeModule(moduleId) // 移除模块
```

#### Use Shape Dynamics
形状动态可以控制笔刷的大小、角度、圆度抖动，你可以通过绑定配置来控制笔刷的动态参数。
```javascript
import { DynamicShapeModule } from 'easy-brush';

const dynamicShapeConfig = {
    sizeJitter: 0.00, // 笔刷大小抖动
    sizeJitterTrigger: "pressure", // 笔刷大小抖动触发方式 (pressure: 笔压, none: 随机)
    minDiameter: 0.00, // 最小笔刷大小
    angleJitter: 0.00, // 笔刷角度抖动
    angleJitterTrigger: "none", // 笔刷角度抖动触发方式 (pressure: 笔压, none: 随机)
    roundJitter: 0.00, // 笔刷圆度抖动
    roundJitterTrigger: "none", // 笔刷圆度抖动触发方式 (pressure: 笔压, none: 随机)
    minRoundness: 0.00, // 最小笔刷圆度
}
const dynamicShapeModule = new DynamicShapeModule()
dynamicShapeModule.bindConfig(dynamicShapeConfig)
brush.useModule(dynamicShapeModule)
```

![DynamicShapeModule](https://github.com/DQLean/Easy-Brush/blob/main/docs/4.png "DynamicShapeModule")

#### Use Transparency Dynamics
透明度动态可以控制笔刷的透明度和流量抖动，你可以通过绑定配置来控制笔刷的动态参数。
```javascript
import { DynamicTransparencyModule } from 'easy-brush';

const dynamicTransparencyConfig = {
    opacityJitter: 0.00, // 笔刷透明度抖动
    opacityJitterTrigger: "none", // 笔刷透明度抖动触发方式 (pressure: 笔压, none: 随机)
    minOpacityJitter: 0.00, // 最小笔刷透明度
    flowJitter: 0.00, // 笔刷流量抖动
    flowJitterTrigger: "none", // 笔刷流量抖动触发方式 (pressure: 笔压, none: 随机)
    minFlowJitter: 0.00, // 最小笔刷流量
}
const dynamicTransparencyModule = new DynamicTransparencyModule()
dynamicTransparencyModule.bindConfig(dynamicTransparencyConfig)
brush.useModule(dynamicTransparencyModule)
```

![DynamicTransparencyModule](https://github.com/DQLean/Easy-Brush/blob/main/docs/5.png "DynamicTransparencyModule")

#### Use Spread
Spread模块可以控制笔刷的散布，你可以通过绑定配置来控制笔刷的动态参数。
```javascript
import { SpreadModule } from 'easy-brush';

const spreadConfig: SpreadBasicConfig = {
    spreadRange: 0.00, // 笔刷散布范围
    spreadTrigger: "none", // 笔刷散布触发方式 (pressure: 笔压, none: 随机)
    count: 0, // 笔刷散布数量
    countJitter: 0.00, // 笔刷散布数量抖动
    countJitterTrigger: "none", // 笔刷散布数量抖动触发方式 (pressure: 笔压, none: 随机)
}
const spreadModule = new SpreadModule()
spreadModule.bindConfig(spreadConfig)
brush.useModule(spreadModule)
```

![SpreadModule](https://github.com/DQLean/Easy-Brush/blob/main/docs/6.png "SpreadModule")

#### Use Pattern (Beta)
Pattern模块可以控制笔刷的纹理，你可以通过绑定配置来控制笔刷的动态参数。
```javascript
import { PatternModule } from 'easy-brush';
const patternModule = new PatternModule(PatternImg, canvas.width, canvas.height)
brush.useModule(patternModule)
```

![Pattern](https://github.com/DQLean/Easy-Brush/blob/main/docs/7.png "Pattern")

## License
This project is licensed under the MIT License.
