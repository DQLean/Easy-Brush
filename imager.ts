/**
 * Brush Image Loader
 * 
 * Transform the image into one suitable for brush use
 */
export class BrushImager {
    private status: boolean = false
    private originImage?: HTMLImageElement | HTMLCanvasElement
    private image?: HTMLImageElement | HTMLCanvasElement

    public get getImage() {
        return this.image
    }

    constructor(img: HTMLImageElement | HTMLCanvasElement | string) {
    }
}

/**
 * Create a brand new image with a brush that you can customize and use
 */
export const createCustomImage = () => {

}