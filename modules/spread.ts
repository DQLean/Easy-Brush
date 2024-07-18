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
    private config: SpreadBasicConfig = defaultConfig;

    constructor(config?: SpreadConfig) {
        this.config = { ...defaultConfig, ...config };
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