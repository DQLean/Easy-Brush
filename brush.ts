import { BrushBasicConfig, BrushConfig } from "./types/config";
import { Module } from "./types/modules";
import { PurePoint, Point, PointCallBack } from "./types/point";
import { getControlPoint, getEquidistantBezierPoints } from "./utils/bezier";
import { toHashColor } from "./utils/color";
import { getAngle, getDistance } from "./utils/math";


// const createCanvas = (function (): (width: number, height: number) => HTMLCanvasElement | OffscreenCanvas {
//     if (typeof OffscreenCanvas === 'undefined') {
//         return (width: number = 0, height: number = 0): HTMLCanvasElement => {
//             const canvas = document.createElement('canvas');
//             canvas.width = width;
//             canvas.height = height;
//             return canvas;
//         }
//     } else {
//         return (width: number = 0, height: number = 0): OffscreenCanvas => {
//             const canvas = new OffscreenCanvas(width, height);
//             return canvas;
//         }
//     }
// })()


// const getContext = (function (): Function {
//     if (typeof OffscreenCanvas === 'undefined') {
//         return (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
//             return canvas.getContext('2d') as CanvasRenderingContext2D;
//         }
//     } else {
//         return (canvas: OffscreenCanvas): OffscreenCanvasRenderingContext2D => {
//             return canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
//         }
//     }
// })

const createCanvas = (width: number = 0, height: number = 0): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}
const getContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
    return canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
}

const defaultBasicConfig: BrushBasicConfig = {
    size: 20,
    opacity: 1.00,
    flow: 1.00,
    color: "#000000",
    angle: 0.00,
    roundness: 1.00,
    spacing: 0.5,
}

/**
 * Basic brush object
 * 
 * @param canvas Canvas Element (If not, please use loadContext to load it later)
 * @param config Brush Config (If not, please access the config property later or use the loadConfig function to modify it)
 */
export class Brush {
    /***********************************Undo/Redo**********************************/
    private canvasStack: ImageData[] = []
    private canvasStackIndex: number = -1;
    /**
     * Maximum number of undo/redo operations (0 means no limit)
     */
    maxUndoRedoStackSize: number = 10
    private initCanvasStack() {
        this.canvasStack = []
        this.canvasStackIndex = -1
        if (this.maxUndoRedoStackSize <= 0) {
            return
        }
        if (this.oriCanvas && this.oriContext) {
            this.canvasStack.push(this.oriContext.getImageData(0, 0, this.oriCanvas.width, this.oriCanvas.height))
            this.canvasStackIndex++
        }

    }
    /**
     * Undo
     */
    undo() {
        if (this.canvasStackIndex > 0) {
            this.canvasStackIndex--;
            this.context?.putImageData(this.canvasStack[this.canvasStackIndex], 0, 0)
            this.oriContext?.putImageData(this.canvasStack[this.canvasStackIndex], 0, 0)
        }
    }
    /**
     * Redo
     */
    redo() {
        if (this.canvasStackIndex < this.canvasStack.length - 1) {
            this.canvasStackIndex++;
            this.context?.putImageData(this.canvasStack[this.canvasStackIndex], 0, 0)
            this.oriContext?.putImageData(this.canvasStack[this.canvasStackIndex], 0, 0)
        }
    }
    /******************************************************************************/

    /***********************************canvas*************************************/
    // Source Canvas
    private canvas?: HTMLCanvasElement;
    private context?: CanvasRenderingContext2D;
    // Original Content Canvas
    private oriCanvas?: HTMLCanvasElement;
    private oriContext?: CanvasRenderingContext2D;
    // Current Draw Canvas
    private strokeCanvas?: HTMLCanvasElement;
    private strokeContext?: CanvasRenderingContext2D;
    // Transfer Canvas
    private transferCanvas?: HTMLCanvasElement;
    private transferContext?: CanvasRenderingContext2D;
    // Shape Canvas
    private shapeCanvas?: HTMLCanvasElement;
    private shapeContext?: CanvasRenderingContext2D;

    private initSourceCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.context = getContext(this.canvas)
    }

    private initOriCanvas(canvas: HTMLCanvasElement) {
        this.oriCanvas = createCanvas(canvas.width, canvas.height)
        this.oriContext = getContext(this.oriCanvas)
        this.oriContext.drawImage(canvas, 0, 0, canvas.width, canvas.height)
    }

    private initStrokeCanvas(canvas: HTMLCanvasElement) {
        this.strokeCanvas = createCanvas(canvas.width, canvas.height)
        this.strokeContext = getContext(this.strokeCanvas)
    }

    private initTransferCanvasCanvas(canvas: HTMLCanvasElement) {
        this.transferCanvas = createCanvas(canvas.width, canvas.height)
        this.transferContext = getContext(this.transferCanvas)

    }

    /**
     * Load the canvas you want to draw
     * @param canvas 
     */
    loadContext(canvas: HTMLCanvasElement) {
        this.initSourceCanvas(canvas)
        this.initOriCanvas(canvas)
        this.initStrokeCanvas(canvas)
        this.initTransferCanvasCanvas(canvas)
        this.initCanvasStack()
    }
    /******************************************************************************/

    private points: Point[] = [];
    private drawCount: number = 0;



    private prePoint?: PurePoint;
    private prePrePoint?: PurePoint;



    private isRender: boolean = false;

    private modules: Map<string, Module> = new Map();

    /** min space pixel */
    private readonly minSpacePixel: number = 0.5;
    /** min render interval */
    private readonly minRenderInterval: number = 3000;
    /** lag distance */
    private readonly lagDistance: number = 5;

    private get shapeRatio(): number {
        if (this.shapeCanvas) {
            return this.shapeCanvas.width / this.shapeCanvas.height;
        } else {
            return 1;
        }
    }

    /** Brush Config */
    config: BrushBasicConfig = defaultBasicConfig;
    /** Is curve smoothing enabled (default: true) */
    isSmooth: boolean = true;
    /** Is interpolation filling enabled (default: true) */
    isSpacing: boolean = true;
    /** Blend Mode (default: 'source-over') */
    blendMode: CanvasRenderingContext2D['globalCompositeOperation'] = 'source-over';
    /** Filter (default: 'none') */
    filter: CanvasRenderingContext2D['filter'] = 'none';



    constructor(canvas?: HTMLCanvasElement, config?: BrushConfig) {
        if (config) this.loadConfig(config)
        if (canvas) this.loadContext(canvas)
    }

    private newPoint(x: number, y: number, pressure: number): Point {
        const cnf = { ...this.config }
        for (let [_, module] of this.modules) {
            if (module.onChangeConfig) {
                module.onChangeConfig(cnf, pressure)
            }
        }
        if (cnf.opacity > 1) cnf.opacity = 1
        else if (cnf.opacity < 0) cnf.opacity = 0
        if (cnf.flow > 1) cnf.flow = 1
        else if (cnf.flow < 0) cnf.flow = 0
        if (cnf.angle > 1) cnf.angle = 1
        else if (cnf.angle < 0) cnf.angle = 0
        if (cnf.roundness > 1) cnf.roundness = 1
        else if (cnf.roundness < 0) cnf.roundness = 0

        return { x, y, pressure, config: cnf }
    }


    private mixin(): void {
        if (!this.canvas || !this.context || !this.oriCanvas || !this.oriContext || !this.strokeCanvas || !this.strokeContext || !this.transferCanvas || !this.transferContext) {
            throw new Error('Canvas not loaded, please use "loadContext" to load it')
        }

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.context.drawImage(this.oriCanvas, 0, 0)

        //@ts-ignore
        let strokeCanvas: HTMLCanvasElement = this.strokeCanvas
        //@ts-ignore
        let strokeContext: CanvasRenderingContext2D = this.strokeContext

        // onMergeCanvas
        for (let [_, module] of this.modules) {
            if (module.onMixinCanvas) {
                [strokeCanvas, strokeContext] = module.onMixinCanvas(this.strokeCanvas, this.strokeContext)
            }
        }

        // transfer canvas
        this.transferContext.clearRect(0, 0, this.transferCanvas.width, this.transferCanvas.height)
        this.transferContext.drawImage(strokeCanvas, 0, 0)

        // blend mode
        const globalCompositeOperation = this.context.globalCompositeOperation
        this.context.globalCompositeOperation = this.blendMode
        // filter
        const filter = this.context.filter
        this.context.filter = this.filter

        this.context.drawImage(this.transferCanvas, 0, 0)

        // blend mode restore
        this.context.globalCompositeOperation = globalCompositeOperation
        // filter restore
        this.context.filter = filter
    }

    private endStroke() {
        if (!this.canvas || !this.context || !this.oriCanvas || !this.oriContext || !this.strokeCanvas || !this.strokeContext || !this.transferCanvas || !this.transferContext) {
            throw new Error('Canvas not loaded, please use "loadContext" to load it')
        }
        //@ts-ignore
        let strokeCanvas: HTMLCanvasElement = this.strokeCanvas
        //@ts-ignore
        let strokeContext: CanvasRenderingContext2D = this.strokeContext

        // onMergeCanvas
        for (let [_, module] of this.modules) {
            if (module.onMixinCanvas) {
                [strokeCanvas, strokeContext] = module.onMixinCanvas(this.strokeCanvas, this.strokeContext)
            }
        }
        // transfer canvas
        this.transferContext.clearRect(0, 0, this.transferCanvas.width, this.transferCanvas.height)
        this.transferContext.drawImage(strokeCanvas, 0, 0)
        this.oriContext.drawImage(this.transferCanvas, 0, 0)
        this.strokeContext.clearRect(0, 0, strokeCanvas.width, strokeCanvas.height)


        // command stack
        if (this.maxUndoRedoStackSize > 0) {
            if (this.canvasStackIndex != this.canvasStack.length - 1) {
                this.canvasStack.splice(this.canvasStackIndex + 1, this.canvasStack.length - this.canvasStackIndex - 1)
            }
            this.canvasStackIndex = this.canvasStack.push((this.context.getImageData(0, 0, this.canvas.width, this.canvas.height))) - 1
            if (this.canvasStack.length > this.maxUndoRedoStackSize) {
                this.canvasStack.shift()
                this.canvasStackIndex--
            }
        }


        // onEndStroke
        for (let [_, module] of this.modules) {
            if (module.onEndStroke) {
                module.onEndStroke()
            }
        }
    }

    // draw point
    private draw() {
        if (!this.oriCanvas || !this.oriContext || !this.strokeCanvas || !this.strokeContext || !this.transferCanvas || !this.transferContext) {
            throw new Error('Canvas not loaded, please use "loadContext" to load it')
        }
        if (this.points.length === 0) {
            return
        }

        const p = this.points.shift() as Point;

        this.strokeContext.save()

        // flow
        this.strokeContext.globalAlpha = p.config.flow

        // opacity
        this.transferContext.globalAlpha = p.config.opacity

        // draw to stroke canvas
        if (this.shapeCanvas && this.shapeContext) {
            // change color
            if (this.shapeContext.fillStyle !== p.config.color.toLowerCase()) {
                console.log(1);

                const globalCompositeOperation = this.shapeContext.globalCompositeOperation
                this.shapeContext.globalCompositeOperation = "source-atop"
                this.shapeContext.fillStyle = toHashColor(p.config.color)
                this.shapeContext.beginPath()
                this.shapeContext.fillRect(0, 0, this.shapeCanvas.width, this.shapeCanvas.height)
                this.shapeContext.globalCompositeOperation = globalCompositeOperation
            }

            //rotate
            this.strokeContext.translate(p.x, p.y)
            this.strokeContext.rotate(-p.config.angle * 360 * Math.PI / 180)
            this.strokeContext.translate(-(p.config.size * p.config.roundness / 2), -(p.config.size / this.shapeRatio / 2))

            const width = p.config.size * p.config.roundness
            const height = p.config.size / this.shapeRatio

            this.strokeContext.drawImage(
                this.shapeCanvas,
                0, 0,
                width, height,
            )

            // rotate back
            // this.strokeContext.translate(-p.x, -p.y)
            // this.strokeContext.rotate(p.config.angle * 360 * Math.PI / 180)
            // this.strokeContext.translate(p.config.size * p.config.roundness / 2, p.config.size / this.shapeRatio / 2)
        } else {
            const size = p.config.size
            const roundness = p.config.roundness
            const smallerRadius = size * roundness
            this.strokeContext.beginPath()
            this.strokeContext.fillStyle = p.config.color
            this.strokeContext.translate(p.x, p.y)
            this.strokeContext.rotate(-p.config.angle * 360 * Math.PI / 180)
            this.strokeContext.ellipse(0, 0, size, smallerRadius, 0, 0, Math.PI * 2, false)
            this.strokeContext.fill()
            // rotate back
            // this.strokeContext.translate(-p.x, -p.y)
            // this.strokeContext.rotate(p.config.angle * 360 * Math.PI / 180)
            this.strokeContext.closePath()
        }

        this.strokeContext.restore()

        // mixin to show canvas
        if (this.points.length === 0 || this.drawCount >= this.minRenderInterval) {
            this.mixin()
            this.drawCount = 0
        } else {
            this.drawCount++
        }

        // strokeEnd
        if (p.strokeEnd === true) {
            this.endStroke()
        }
        // callback
        if (p.callback) try {
            p.callback()
        } catch (err) { console.error(err) }
    }



    private imageInitColoring() {
        if (!this.shapeCanvas || !this.shapeContext) return
        const oriGlobalCompositeOperation = this.shapeContext.globalCompositeOperation
        this.shapeContext.globalCompositeOperation = "source-atop"
        this.shapeContext.fillStyle = "#000000"
        this.shapeContext.beginPath()
        this.shapeContext.rect(0, 0, this.shapeCanvas.width, this.shapeCanvas.height)
        this.shapeContext.fill()
        this.shapeContext.closePath()
        this.shapeContext.globalCompositeOperation = oriGlobalCompositeOperation
    }

    private loadImageWithCanvas(img: HTMLCanvasElement) {
        const canvas = img
        if (canvas.width === 0 || canvas.height === 0) {
            console.warn("[loadImage] Canvas size is 0, please check your canvas.")
            return
        }
        this.shapeCanvas = canvas
        this.shapeContext = canvas.getContext("2d") as CanvasRenderingContext2D;

        this.imageInitColoring()
    }

    private loadImageWithElement(img: HTMLImageElement) {
        const image = img as HTMLImageElement
        const shapeCvs = document.createElement("canvas")
        if (image.naturalWidth === 0 || image.naturalHeight === 0) {
            console.warn("[loadImage] Image natural size is 0, please check your image url.")
            return
        }
        shapeCvs.width = image.naturalWidth
        shapeCvs.height = image.naturalHeight
        const shapeCtx = shapeCvs.getContext("2d") as CanvasRenderingContext2D;
        shapeCtx.globalAlpha = 1
        shapeCtx.drawImage(image, 0, 0, shapeCvs.width, shapeCvs.height)
        this.shapeCanvas = shapeCvs
        this.shapeContext = shapeCtx

        this.imageInitColoring()
    }

    private loadImageWithUrl(url: string, callback?: Function, onError?: Function) {
        const image = new Image();
        image.src = url;
        image.onload = () => {
            this.loadImageWithElement(image)
            callback?.()
        };
        image.onerror = () => {
            onError?.()
        }
    }

    /**
     * Load/Modify Brush Configuration
     * 
     * This function only exists in the config field. 
     * 
     * You can also modify brush.config
     * 
     * @example
     * brush.loadConfig({size: 10})
     * brush.config.size = 10
     */
    loadConfig(config: BrushConfig) {
        if (config.size != void 0 && config.size != null) this.config.size = config.size;
        if (config.opacity != void 0 && config.opacity != null) this.config.opacity = config.opacity;
        if (config.flow != void 0 && config.flow != null) this.config.flow = config.flow;
        if (config.color != void 0 && config.color != null) this.config.color = config.color;
        if (config.angle != void 0 && config.angle != null) this.config.angle = config.angle;
        if (config.roundness != void 0 && config.roundness != null) this.config.roundness = config.roundness;
        if (config.spacing != void 0 && config.spacing != null) this.config.spacing = config.spacing;
    }

    /**
     * Bind config to brush. 
     * 
     * If you do this, the brush config will change with the external config
     */
    bindConfig(config: BrushBasicConfig) {
        this.config = config
    }


    /**
     * This function allows loading images as brush styles.
     * 
     * The image format has strict requirements. 
     * Please use '.png' images with a transparent background or other image formats 
     * with a transparent background. Pixels with content in the image will be used as the pattern shape.
     * 
     * Tip: It takes some time to load images based on URL (string) ! ! ! 
     * Pls use 'callback' param or 'loadImageAsync' Function If img as string ! ! !
     */
    loadImage(img: HTMLImageElement | HTMLCanvasElement | string, callback?: (isSuc: boolean) => void) {
        if (img instanceof HTMLCanvasElement) {
            this.loadImageWithCanvas(img)
            callback?.(true)
        } else if (img instanceof HTMLImageElement) {
            this.loadImageWithElement(img)
            callback?.(true)
        } else {
            this.loadImageWithUrl(img, () => { callback?.(true) }, () => { callback?.(false) })
        }
    }

    /**
     * Asynchronous version of 'loadImage'
     */
    loadImageAsync(img: HTMLImageElement | HTMLCanvasElement | string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.loadImage(img, (isSuc) => {
                if (isSuc) resolve()
                else reject()
            })
        })
    }

    removeImage() {
        this.shapeCanvas = void 0
        this.shapeContext = void 0
    }

    /**
     * Add the current point to the point pool, 
     * which will be rendered when the render function is called 
     * (interpolation and Bessel calculations will be performed)
     */
    putPoint(x: number, y: number, pressure: number) {
        if (!this.prePoint || !this.isSpacing) {
            this.prePrePoint = this.prePoint
            this.prePoint = { x, y, pressure }
            // When there is no previous point or spacing is not enabled, simply add it to the coordinate pool without calculating interpolation
            let isHandled = false
            for (let [_, module] of this.modules) {
                if (module.onChangePoint) {
                    const res = module.onChangePoint({ x, y, pressure }, { ...this.config })
                    if (Array.isArray(res)) {
                        for (let p of res) {
                            const point: Point = this.newPoint(p.x, p.y, p.pressure)
                            this.points.push(point)
                        }
                    } else {
                        const point: Point = this.newPoint(res.x, res.y, res.pressure)
                        this.points.push(point)
                    }
                    isHandled = true
                }
            }
            if (!isHandled) {
                const point: Point = this.newPoint(x, y, pressure)
                this.points.push(point)

            }
        } else {
            // Calculate whether interpolation is required between the current point and the previous point, and calculate interpolation and Bezier transform
            const p1: PurePoint = { x, y, pressure }
            const p2: PurePoint = this.prePoint
            const p3: PurePoint = this.prePrePoint || p2
            let distance = getDistance(p2.x, p2.y, p1.x, p1.y)

            let space = this.config.spacing * this.config.size
            if (space < this.minSpacePixel) space = this.minSpacePixel
            if (Math.floor(distance / space) <= 0) return
            if (distance < this.lagDistance + space) return
            // 将x，y坐标改为上一个点朝原x，y坐标移动(distance - lagDistance)后的坐标
            const angle = getAngle(p2.x, p2.y, p1.x, p1.y)
            p1.x = p2.x + Math.cos(angle) * (distance - this.lagDistance)
            p1.y = p2.y + Math.sin(angle) * (distance - this.lagDistance)
            distance = distance - this.lagDistance
            // 获取贝塞尔控制点
            const control = getControlPoint(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)

            // 上一个插值点
            const lastP = { x: p1.x, y: p1.y, pressure: p1.pressure }

            if (this.isSmooth) {
                const points = getEquidistantBezierPoints(p2.x, p2.y, control.x, control.y, p1.x, p1.y, space)

                for (const i in points) {
                    if (!Object.prototype.hasOwnProperty.call(points, i)) {
                        continue
                    }

                    const point = points[i];
                    const t = parseInt(i) / points.length
                    const curPressure = p2.pressure + (p1.pressure - p2.pressure) * t

                    lastP.x = point.x
                    lastP.y = point.y
                    lastP.pressure = curPressure

                    let isHandled = false
                    for (let [_, module] of this.modules) {
                        if (module.onChangePoint) {
                            const res = module.onChangePoint({ x: point.x, y: point.y, pressure: curPressure }, { ...this.config })

                            if (Array.isArray(res)) {
                                for (let p of res) {
                                    this.points.push(this.newPoint(p.x, p.y, p.pressure))
                                }
                            } else {
                                this.points.push(this.newPoint(res.x, res.y, res.pressure))
                            }
                            isHandled = true
                        }
                    }
                    if (!isHandled) {
                        this.points.push(this.newPoint(point.x, point.y, curPressure))
                    }
                }
            } else {
                for (let i = space; i <= distance; i += space) {
                    const t = i / distance
                    const curPressure = p2.pressure + (p1.pressure - p2.pressure) * t

                    let pointX: number, pointY: number = 0

                    pointX = p2.x + Math.cos(angle) * i
                    pointY = p2.y + Math.sin(angle) * i

                    lastP.x = pointX
                    lastP.y = pointY
                    lastP.pressure = curPressure

                    let isHandled = false
                    for (let [_, module] of this.modules) {
                        if (module.onChangePoint) {
                            const res = module.onChangePoint({ x: pointX, y: pointY, pressure: curPressure }, { ...this.config })
                            if (Array.isArray(res)) {
                                for (let p of res) {
                                    this.points.push(this.newPoint(p.x, p.y, p.pressure))
                                }
                            } else {
                                this.points.push(this.newPoint(res.x, res.y, res.pressure))
                            }
                            isHandled = true
                        }
                    }
                    if (!isHandled) {
                        this.points.push(this.newPoint(pointX, pointY, curPressure))
                    }
                }
            }

            this.prePrePoint = this.prePoint
            this.prePoint = { x: lastP.x, y: lastP.y, pressure: lastP.pressure }
        }
    }

    /**
     * Start rendering the coordinate queue data until all the queue data has been rendered, 
     * which means that once the render function is run, 
     * it will only end when all the coordinate queues have been rendered
     * 
     * The render will not run the second one repeatedly. 
     * If the rendering is not completed and the render is called repeatedly, 
     * it will not produce any effect, so feel free to call it
     */
    render() {
        if (this.isRender) return
        this.isRender = true
        const loop = () => {
            for (let i = 0; i < this.minRenderInterval; i++) {
                if (this.points.length === 0) break
                this.draw()
            }
            if (this.points.length > 0) {
                run()
            } else {
                this.isRender = false
            }
        }
        const run = () => {
            try {
                requestAnimationFrame(loop)
            } catch {
                loop()
            }
        }
        run()
    }

    /** 
     * Reset brush run data
     * 
     * This reset does not clear the queue data that has not been fully rendered yet. 
     * It only eliminates the impact of the current pen on the next one. 
     * If not cleared, there may be a connection between the end of the previous pen 
     * and the beginning of the current pen, as well as other bugs
     */
    finalizeStroke(callback?: PointCallBack) {
        this.prePoint = void 0
        this.prePrePoint = void 0
        if (this.points.length > 0) {
            this.points[this.points.length - 1].strokeEnd = true
        }
        if (this.points.length > 0) {
            this.points[this.points.length - 1].strokeEnd = true
        } else {
            this.endStroke()
        }
        if (callback) {
            if (this.points.length === 0) {
                try {
                    callback()
                } catch (err) { console.error(err) }
            } else this.points[this.points.length - 1].callback = callback
        }
    }

    /**
     * Clear all canvas
     */
    clear() {
        this.points = []
        this.prePoint = void 0
        this.prePrePoint = void 0
        this.canvas && this.context && this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.oriCanvas && this.oriContext && this.oriContext.clearRect(0, 0, this.oriCanvas.width, this.oriCanvas.height)
        this.strokeCanvas && this.strokeContext && this.strokeContext.clearRect(0, 0, this.strokeCanvas.width, this.strokeCanvas.height)
        this.transferCanvas && this.transferContext && this.transferContext.clearRect(0, 0, this.transferCanvas.width, this.transferCanvas.height)
    }

    /**
     * Use a module
     * @returns module unique id
     */
    useModule(module: Module): string {
        for (const [id, existingModule] of this.modules) {
            if (JSON.stringify(existingModule) === JSON.stringify(module)) {
                return id;
            }
        }
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        this.modules.set(uniqueId, module)
        return uniqueId
    }

    /**
     * Remove a module
     */
    removeModule(uniqueId: string): boolean {
        if (this.modules.has(uniqueId)) {
            this.modules.delete(uniqueId);
            return true;
        }
        return false
    }
}