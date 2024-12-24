export interface Point {
    x: number
    y: number
    pressure: number
}

/**
 * Mouse pen pressure simulation
 * 
 * When you move the mouse faster, the pen pressure decreases, and vice versa, the pen pressure increases
 * 
 * @param {number} k changing index
 */
export class MousePressure {
    private readonly MIDDLE_PRESSURE = 0.5
    private readonly MAX_PRESSURE = 0.8
    private readonly MIN_PRESSURE = 0.2
    private readonly STEP = 0.01
    private K: number
    private minRange: number
    private maxRange: number

    private _status = false

    private prePoint?: Point = void 0

    constructor(k = 3, minRange = 10, maxRange = 100) {
        this.K = k
        this.minRange = minRange
        this.maxRange = maxRange
        this._status = true
    }

    /**
     * Get current pen pressure
     * @param x x coordinate
     * @param y y coordinate
     * @returns {number} pressure
     */
    getPressure(x: number, y: number): number {
        if (!this._status) return this.MIDDLE_PRESSURE
        if (!this.prePoint) {
            this.prePoint = { x, y, pressure: this.MIDDLE_PRESSURE }
            return this.MIDDLE_PRESSURE
        }
        const distance = Math.sqrt((x - this.prePoint.x) ** 2 + (y - this.prePoint.y) ** 2)
        let range = this.prePoint.pressure

        const t = 1 + (10 - 1) * (1 - Math.exp(-this.K * distance))
        
        if (distance < this.minRange) {
            range += this.STEP * t
        } else if (distance > this.maxRange) {
            range -= this.STEP * t
        } else {
            if (range < this.MIDDLE_PRESSURE) {
                range += this.STEP * t
            } else if (range > this.MIDDLE_PRESSURE) {
                range -= this.STEP * t
            }
        }
        if (range > this.MAX_PRESSURE) range = this.MAX_PRESSURE
        else if (range < this.MIN_PRESSURE) range = this.MIN_PRESSURE

        this.prePoint = { x, y, pressure: range }
        return range
    }

    /**
     * Reset pen pressure data
     * 
     * Reset the data to its initial state, you need to use it after each transaction ends
     */
    reset() {
        this.prePoint = void 0
    }

    /**
     * Close pen pressure simulation
     */
    close() {
        this._status = false
        this.reset()
    }
    /**
     * Open pen pressure simulation
     */
    open() {
        this._status = true
        this.reset()
    }

    /**
     * Get pen pressure simulation status
     */
    status() {
        return this._status
    }
}