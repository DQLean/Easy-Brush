import { BrushBasicConfig, BrushAdvancedConfig, BrushConfig } from "./types/config";
import { PurePoint, Point, PointCallBack } from "./types/point";
import { getControlPoint, quadraticBezier } from "./utils/bezier";
import { getAngle, getDistance } from "./utils/math";

const defaultCvs: HTMLCanvasElement = document.createElement('canvas');
const defaultCtx: CanvasRenderingContext2D = defaultCvs.getContext('2d') as CanvasRenderingContext2D;

const defaultBasicConfig: BrushBasicConfig = {
    size: 20,
    opacity: 1.00,
    flow: 1.00,
    color: "#000000",
    angle: 0.00,
    roundness: 1.00,
    spacing: 0.5,
}

const defaultAdvancedConfig: BrushAdvancedConfig = {
    isSmooth: true, // Is curve smoothing enabled
    isSpacing: true, // Is interpolation filling enabled
}

export class Brush {
    // Original Content Canvas
    private oriCanvas: HTMLCanvasElement = defaultCvs;
    private oriContext: CanvasRenderingContext2D = defaultCtx;
    // Mixed Display Canvas
    private showCanvas: HTMLCanvasElement = defaultCvs;
    private showContext: CanvasRenderingContext2D = defaultCtx;
    // Draw Canvas
    private strokeCanvas: HTMLCanvasElement = defaultCvs;
    private strokeContext: CanvasRenderingContext2D = defaultCtx;
    // Shape Canvas
    private shapeCanvas?: HTMLCanvasElement;
    private shapeContext?: CanvasRenderingContext2D;



    private blendMode: CanvasRenderingContext2D['globalCompositeOperation'] = 'source-over';
    private filter: CanvasRenderingContext2D['filter'] = 'none';



    private config: BrushBasicConfig = defaultBasicConfig;
    private advancedConfig: BrushAdvancedConfig = defaultAdvancedConfig;



    private points: Point[] = [];
    private drawCount: number = 0;



    private prePoint?: PurePoint;
    private prePrePoint?: PurePoint;



    private isRender: boolean = false;



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

    constructor(canvas: HTMLCanvasElement, config?: BrushConfig) {
        if (config) this.loadConfig(config)
        this.loadContext(canvas)
    }

    private checkConfig(cnf: BrushBasicConfig): BrushBasicConfig {
        let { size, opacity, flow, color, angle, roundness, spacing } = cnf;

        if (opacity > 1) opacity = 1
        else if (opacity < 0) opacity = 0
        if (flow > 1) flow = 1
        else if (flow < 0) flow = 0
        if (angle > 1) angle = 1
        else if (angle < 0) angle = 0
        if (roundness > 1) roundness = 1
        else if (roundness < 0) roundness = 0

        return {
            size,
            opacity,
            flow,
            color,
            angle,
            roundness,
            spacing,
        }
    }

    // start drawing
    private draw() {
        if (this.points.length === 0) return

        const p = this.points.shift() as Point;

        this.strokeContext.save()
        this.strokeContext.beginPath()

        // flow
        this.strokeContext.globalAlpha = (p.config.opacity / 1) * p.config.flow

        // draw to stroke canvas
        if (this.shapeCanvas && this.shapeContext) {
            // change color
            if (this.shapeContext.fillStyle !== p.config.color.toLowerCase()) {
                const globalCompositeOperation = this.shapeContext.globalCompositeOperation
                this.shapeContext.globalCompositeOperation = "source-atop"
                this.shapeContext.fillStyle = p.config.color
                this.shapeContext.beginPath()
                this.shapeContext.fillRect(0, 0, this.shapeCanvas.width, this.shapeCanvas.height)
                this.shapeContext.globalCompositeOperation = globalCompositeOperation
            }

            //rotate
            this.strokeContext.translate(p.x, p.y)
            this.strokeContext.rotate(Math.PI * 2 - p.config.angle)
            this.strokeContext.translate(-(p.config.size / 2), -(p.config.size / this.shapeRatio / 2))

            const width = p.config.size * p.config.roundness
            const height = p.config.size / this.shapeRatio

            this.strokeContext.drawImage(
                this.shapeCanvas,
                0, 0,
                width, height,
            )
        } else {
            this.strokeContext.fillStyle = p.config.color
            this.strokeContext.arc(p.x, p.y, p.config.size / 2, 0, Math.PI * 2, false)
            this.strokeContext.fill()
        }

        // render to show canvas
        if (this.points.length === 0 || this.drawCount >= this.minRenderInterval) {
            const globalCompositeOperation = this.showContext.globalCompositeOperation
            const globalAlpha = this.showContext.globalAlpha

            this.showContext.clearRect(0, 0, this.showCanvas.width, this.showCanvas.height)
            this.showContext.drawImage(this.oriCanvas, 0, 0)

            // blend mode
            this.showContext.globalCompositeOperation = this.blendMode
            // filter
            this.showContext.filter = this.filter

            // mix
            this.showContext.drawImage(this.strokeCanvas, 0, 0)

            // restore
            this.showContext.filter = ""
            this.showContext.globalCompositeOperation = globalCompositeOperation
            this.showContext.globalAlpha = globalAlpha

            this.drawCount = 0
        } else {
            this.drawCount++
        }

        this.strokeContext.restore()

        // callback
        if (p.callback) try { p.callback() } catch (err) { console.error(err) }
    }

    private loadContext(canvas: HTMLCanvasElement) {
        const showCvs = canvas;
        const showCtx = canvas.getContext('2d') as CanvasRenderingContext2D;

        const oriCvs = document.createElement("canvas")
        oriCvs.width = showCvs.width
        oriCvs.height = showCvs.height
        const oriCtx = oriCvs.getContext("2d") as CanvasRenderingContext2D;
        oriCtx.drawImage(showCvs, 0, 0)

        const strokeCvs = document.createElement("canvas")
        strokeCvs.width = showCvs.width
        strokeCvs.height = showCvs.height
        const strokeCtx = strokeCvs.getContext("2d") as CanvasRenderingContext2D;

        this.oriCanvas = oriCvs
        this.oriContext = oriCtx
        this.showCanvas = showCvs
        this.showContext = showCtx
        this.strokeCanvas = strokeCvs
        this.strokeContext = strokeCtx
    }

    private imageInitColoring() {
        if (!this.shapeCanvas || !this.shapeContext) return
        const oriGlobalCompositeOperation = this.shapeContext.globalCompositeOperation
        this.shapeContext.globalCompositeOperation = "source-atop"
        this.shapeContext.fillStyle = "#000"
        this.shapeContext.beginPath()
        this.shapeContext.rect(0, 0, this.shapeCanvas.width, this.shapeCanvas.height)
        this.shapeContext.fill()
        this.shapeContext.closePath()
        this.shapeContext.globalCompositeOperation = oriGlobalCompositeOperation
    }

    private loadImageWithCanvas(img: HTMLCanvasElement) {
        const canvas = img
        this.shapeCanvas = canvas
        this.shapeContext = canvas.getContext("2d") as CanvasRenderingContext2D;

        this.imageInitColoring()
    }

    private loadImageWithElement(img: HTMLImageElement) {
        const image = img as HTMLImageElement
        const shapeCvs = document.createElement("canvas")
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
     * set brush config
     */
    setConfig<T extends keyof BrushBasicConfig>(key: T, val: BrushBasicConfig[T]) {
        this.config[key] = val;
    }

    /**
     * set advanced config
     */
    setAdvancedConfig<T extends keyof BrushAdvancedConfig>(key: T, val: BrushAdvancedConfig[T]) {
        this.advancedConfig[key] = val;
    }

    /**
     * Load/Modify Brush Configuration
     */
    loadConfig(config: BrushConfig) {
        this.config = {
            size: config.size ?? this.config.size,
            opacity: config.opacity ?? this.config.opacity,
            flow: config.flow ?? this.config.flow,
            color: config.color ?? this.config.color,
            angle: config.angle ?? this.config.angle,
            roundness: config.roundness ?? this.config.roundness,
            spacing: config.spacing ?? this.config.spacing,
        };
    }


    /**
     * This function allows loading images as brush styles.
     * 
     * The image format has strict requirements. 
     * Please use '.png' images with a transparent background or other image formats 
     * with a transparent background. Pixels with content in the image will be used as the pattern shape.
     * 
     * Tip: Image loading may take some time ! ! ! Pls use callback or 'loadImageAsync' Function ! ! !
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

    /**
     * Add the current point to the point pool, 
     * which will be rendered when the render function is called 
     * (interpolation and Bessel calculations will be performed)
     */
    putPoint(x: number, y: number, pressure: number) {
        if (!this.prePoint || !this.advancedConfig.isSpacing) {
            /**
             * 如果不存在前一个点，或者不启用间距，则直接加入坐标池，无需计算插值
             */
            const point: Point = { x, y, pressure, config: { ...this.config } }
            this.points.push(point)
            this.prePrePoint = this.prePoint
            this.prePoint = { ...point }
        } else {
            /**
             * 计算当前点与前一个点之间是否需要插值，并且计算插值及贝塞尔变换
             */
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

            // 当前插值点列表
            const interpolationPoints = []
            // 上一个插值点
            const lastP = { x: p1.x, y: p1.y }

            for (let i = space; i <= distance; i += space) {
                const t = i / distance
                const curPressure = p2.pressure + (p1.pressure - p2.pressure) * t

                const point: Point = {
                    x: 0,
                    y: 0,
                    pressure: curPressure,
                    config: this.checkConfig(this.config)
                }

                if (this.advancedConfig.isSmooth) {
                    // 贝塞尔变换
                    const { x, y } = quadraticBezier(t, p2.x, p2.y, control.x, control.y, p1.x, p1.y)
                    point.x = x
                    point.y = y
                } else {
                    // 不使用贝塞尔变换
                    point.x = p2.x + Math.cos(angle) * i
                    point.y = p2.y + Math.sin(angle) * i
                }

                if (interpolationPoints.length > 0) {
                    // 矫正贝塞尔变换后的space差异
                    const intDist = getDistance(point.x, point.y, lastP.x, lastP.y)
                    if (intDist != space) {
                        const angle = getAngle(lastP.x, lastP.y, point.x, point.y)
                        point.x = lastP.x + Math.cos(angle) * space
                        point.y = lastP.y + Math.sin(angle) * space
                    }
                }

                lastP.x = point.x
                lastP.y = point.y

                interpolationPoints.push(point)
            }

            this.points = this.points.concat(interpolationPoints)
            this.prePrePoint = this.prePoint
            this.prePoint = { x: lastP.x, y: lastP.y, pressure }
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
        if (callback) {
            if (this.points.length === 0) {
                try { callback() } catch (err) { console.error(err) }
            } else this.points[this.points.length - 1].callback = callback
        }
    }
}