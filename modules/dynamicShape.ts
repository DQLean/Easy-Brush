import { BrushBasicConfig } from "../types/config";
import { DynamicShapeBasicConfig, DynamicShapeConfig } from "../types/dynamicShape";
import { PurePoint } from "../types/point";
import { clamp } from "../utils/math";
import { randomRound } from "../utils/random";

const defaultConfig: DynamicShapeBasicConfig = {
    sizeJitter: 0.00,
    sizeJitterTrigger: "none",
    minDiameter: 0.00,
    angleJitter: 0.00,
    angleJitterTrigger: "none",
    roundJitter: 0.00,
    roundJitterTrigger: "none",
    minRoundness: 0.00,
}

export class DynamicShape {
    private config: DynamicShapeBasicConfig = defaultConfig;
    constructor(config?: DynamicShapeConfig) {
        this.config = { ...defaultConfig, ...config };
    }

    private changeSize(size: number, pressure: number): number {
        let newSize = size
        if (this.config.sizeJitterTrigger === "pressure") {
            newSize = size * (pressure * 2)
        }
        const jitterValue = newSize * this.config.sizeJitter
        newSize = clamp(randomRound(newSize - jitterValue, newSize), 0, newSize)
        if (newSize < size * this.config.minDiameter) {
            newSize = size * this.config.minDiameter
        }

        return newSize
    }

    private changeAngle(angle: number, pressure: number): number {
        let newAngle = angle

        const cir = Math.PI * 2

        if (this.config.angleJitterTrigger === "pressure") {
            if (pressure <= 0.5) {
                newAngle = (newAngle + cir * (0.5 - pressure)) % cir
            } else {
                newAngle = (newAngle - cir * (pressure - 0.5)) % cir
            }
        }
        const jitterValue = cir * this.config.angleJitter
        newAngle = (randomRound(newAngle - jitterValue, newAngle + jitterValue, 100)) % cir
        return newAngle
    }

    private changeRoundness(roundness: number, pressure: number): number {
        let newRoundness = roundness

        if (this.config.roundJitterTrigger === "pressure") {
            newRoundness = roundness * (pressure * 2)
        }

        const jitterValue = newRoundness * this.config.roundJitter
        newRoundness = clamp(randomRound(newRoundness - jitterValue, newRoundness, 100), 0, newRoundness)
        if (newRoundness < this.config.minRoundness) {
            newRoundness = this.config.minRoundness
        }

        return newRoundness
    }

    onChangeConfig(config: BrushBasicConfig, point: PurePoint) {
        config.size = this.changeSize(config.size, point.pressure)
        config.angle = this.changeAngle(config.angle, point.pressure)
        config.roundness = this.changeRoundness(config.roundness, point.pressure)
    }
}