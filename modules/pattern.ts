import { PatternBasicConfig, PatternConfig } from "../types/pattern";

const defaultConfig: PatternBasicConfig = {
    scale: 1.00,
    brightness: 0,
    contrast: 0,
    blendMode: "source-over",
}

/**
 * @param {HTMLCanvasElement} canvas original canvas. Used to obtain width and height
 */
export class PatternModule {
    /** module config */
    config: PatternBasicConfig = defaultConfig;

    private patternCanvas: HTMLCanvasElement = document.createElement('canvas');
    private patternContext: CanvasRenderingContext2D = this.patternCanvas.getContext('2d') as CanvasRenderingContext2D;

    private patternBlendCanvas: HTMLCanvasElement = document.createElement('canvas');
    private patternBlendContext: CanvasRenderingContext2D = this.patternBlendCanvas.getContext('2d') as CanvasRenderingContext2D;

    constructor(resource: string | HTMLCanvasElement | HTMLImageElement, canvasWidth: number, canvasHeight: number, patternColor?: string, config?: PatternConfig) {
        if (config?.scale != void 0 && config?.scale != null) this.config.scale = config.scale;
        if (config?.brightness != void 0 && config?.brightness != null) this.config.brightness = config.brightness;
        if (config?.contrast != void 0 && config?.contrast != null) this.config.contrast = config.contrast;
        if (config?.blendMode != void 0 && config?.blendMode != null) this.config.blendMode = config.blendMode;

        this.loadPattern(resource, canvasWidth, canvasHeight, patternColor)
    }

    private loadImageWithUrl(url: string): Promise<HTMLCanvasElement> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = url;
            image.onload = () => {
                resolve(this.loadImageWithElement(image))
            };
            image.onerror = (e) => {
                reject(e)
            }
        })
    }

    private loadImageWithElement(img: HTMLImageElement): HTMLCanvasElement {
        const image = img as HTMLImageElement
        const shapeCvs = document.createElement("canvas")
        if (image.naturalWidth === 0 || image.naturalHeight === 0) {
            console.warn("[loadImage] Image natural size is 0, please check your image url.")
        }
        shapeCvs.width = image.naturalWidth
        shapeCvs.height = image.naturalHeight
        const shapeCtx = shapeCvs.getContext("2d") as CanvasRenderingContext2D;
        shapeCtx.globalAlpha = 1
        shapeCtx.drawImage(image, 0, 0, shapeCvs.width, shapeCvs.height)

        return shapeCvs
    }

    /**
     * Load pattern image resource
     * 
     * If there is no width height, the image will repeat
     * @param resource pattern image resource
     * @param width canvas width
     * @param height canvas height
     */
    async loadPattern(resource: HTMLImageElement | HTMLCanvasElement | string, canvasWidth: number, canvasHeight: number, patternColor?: string) {
        if (canvasWidth === 0 || canvasHeight === 0) return

        let image: HTMLCanvasElement = document.createElement("canvas")
        if (typeof resource == 'string') {
            image = await this.loadImageWithUrl(resource)
        } else if (resource instanceof HTMLImageElement) {
            image = this.loadImageWithElement(resource)
        } else if (resource instanceof HTMLCanvasElement) {
            image = resource
        }

        const cvs = document.createElement("canvas")
        cvs.width = image.width * this.config.scale
        cvs.height = image.height * this.config.scale
        const ctx = cvs.getContext("2d") as CanvasRenderingContext2D;
        let filterFunc = ""
        if (this.config.brightness) filterFunc += `brightness(${this.config.brightness}%)`
        if (this.config.contrast) filterFunc += `contrast(${this.config.contrast}%)`
        if (filterFunc) ctx.filter = filterFunc
        ctx.drawImage(image, 0, 0, cvs.width, cvs.height)
        if (patternColor) {
            ctx.globalCompositeOperation = "multiply"
            ctx.globalAlpha = 0.5
            ctx.fillStyle = patternColor
            ctx.fillRect(0, 0, cvs.width, cvs.height)
            ctx.globalCompositeOperation = "source-over"
            ctx.globalAlpha = 1.0
        }

        this.patternCanvas.width = canvasWidth
        this.patternCanvas.height = canvasHeight
        this.patternBlendCanvas.width = canvasWidth
        this.patternBlendCanvas.height = canvasHeight

        this.patternContext.beginPath()

        this.patternContext.fillStyle = this.patternContext.createPattern(cvs, "repeat") as CanvasPattern
        this.patternContext.fillRect(0, 0, canvasWidth, canvasHeight)
    }

    /**
     * Bind config to brush. 
     * 
     * If you do this, the brush config will change with the external config
     */
    bindConfig(config: PatternBasicConfig) {
        this.config = config
    }

    onMergeCanvas(showCanvas: HTMLCanvasElement, showContext: CanvasRenderingContext2D, strokeCanvas: HTMLCanvasElement, strokeContext: CanvasRenderingContext2D): [HTMLCanvasElement, CanvasRenderingContext2D] {
        const patternGlobalCompositeOperation = this.patternBlendContext.globalCompositeOperation
        this.patternBlendContext.clearRect(0, 0, this.patternBlendCanvas.width, this.patternBlendCanvas.height)
        this.patternBlendContext.drawImage(this.patternCanvas, 0, 0)
        this.patternBlendContext.globalCompositeOperation = "destination-in"
        this.patternBlendContext.drawImage(strokeCanvas, 0, 0)

        this.patternBlendContext.globalCompositeOperation = this.config.blendMode
        this.patternBlendContext.drawImage(strokeCanvas, 0, 0)
        this.patternBlendContext.globalCompositeOperation = patternGlobalCompositeOperation

        return [this.patternBlendCanvas, this.patternBlendContext]
    }
}