import { BrushBasicConfig } from "../types/config";
import { Point, PurePoint } from "../types/point";
import { SpreadBasicConfig, SpreadConfig } from "../types/spread";
import { clamp } from "../utils/math";
import { randomND, randomRound } from "../utils/random";

const defaultConfig: SpreadBasicConfig = {
    spreadRange: 0.00,
    spreadTrigger: "none",
    count: 1,
    countJitter: 0.00,
    countJitterTrigger: "none",
}

export class SpreadModule {
    /** module config */
    config: SpreadBasicConfig = defaultConfig;

    constructor(config?: SpreadConfig) {
        if (config?.spreadRange != void 0 && config?.spreadRange != null) this.config.spreadRange = config.spreadRange;
        if (config?.spreadTrigger != void 0 && config?.spreadTrigger != null) this.config.spreadTrigger = config.spreadTrigger;
        if (config?.count != void 0 && config?.count != null) this.config.count = config.count;
        if (config?.countJitter != void 0 && config?.countJitter != null) this.config.countJitter = config.countJitter;
        if (config?.countJitterTrigger != void 0 && config?.countJitterTrigger != null) this.config.countJitterTrigger = config.countJitterTrigger;
    }

    /**
     * Bind config to brush. 
     * 
     * If you do this, the brush config will change with the external config
     */
    bindConfig(config: SpreadBasicConfig) {
        this.config = config
    }

    private spread(size: number, x: number, y: number, pressure: number): PurePoint[] {
        let count = this.config.count
        if (this.config.countJitterTrigger === "pressure") {
            count = count - Math.round(count * (1 - pressure * 2))
        }
        const jitterValue = Math.round(count * this.config.countJitter)
        count = clamp(randomRound(count - jitterValue, count), 1, count)

        if (count < 1) count = 1

        const newCoordinates: PurePoint[] = []
        for (let i = 0; i < count; i++) {
            const coordinate = { x: 0, y: 0, pressure: pressure }

            if (this.config.spreadTrigger === "pressure") {
                size = size * (pressure * 2)
            }
            coordinate.x = randomND(x, size * this.config.spreadRange / 2)
            coordinate.y = randomND(y, size * this.config.spreadRange / 2)

            newCoordinates.push(coordinate)
        }
        return newCoordinates
    }

    onChangePoint?(point: PurePoint, config: BrushBasicConfig): PurePoint | PurePoint[] {
        return this.spread(config.size, point.x, point.y, point.pressure)
    }
}