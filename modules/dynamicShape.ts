import { BrushBasicConfig } from "../types/config";
import { DynamicShapeBasicConfig, DynamicShapeConfig } from "../types/dynamicShape";
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

export class DynamicShapeModule {
    /** module config */
    config: DynamicShapeBasicConfig = defaultConfig;

    constructor(config?: DynamicShapeConfig) {
        if (config?.sizeJitter != void 0 && config?.sizeJitter != null) this.config.sizeJitter = config.sizeJitter;
        if (config?.sizeJitterTrigger != void 0 && config?.sizeJitterTrigger != null) this.config.sizeJitterTrigger = config.sizeJitterTrigger;
        if (config?.angleJitter != void 0 && config?.angleJitter != null) this.config.angleJitter = config.angleJitter;
        if (config?.angleJitterTrigger != void 0 && config?.angleJitterTrigger != null) this.config.angleJitterTrigger = config.angleJitterTrigger;
        if (config?.roundJitter != void 0 && config?.roundJitter != null) this.config.roundJitter = config.roundJitter;
        if (config?.roundJitterTrigger != void 0 && config?.roundJitterTrigger != null) this.config.roundJitterTrigger = config.roundJitterTrigger;
        if (config?.minDiameter != void 0 && config?.minDiameter != null) this.config.minDiameter = config.minDiameter;
        if (config?.minRoundness != void 0 && config?.minRoundness != null) this.config.minRoundness = config.minRoundness;
    }

    /**
     * Bind config to brush. 
     * 
     * If you do this, the brush config will change with the external config
     */
    bindConfig(config: DynamicShapeBasicConfig) {
        this.config = config
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

    onChangeConfig(config: BrushBasicConfig, pressure: number) {
        config.size = this.changeSize(config.size, pressure)
        config.angle = this.changeAngle(config.angle, pressure)
        config.roundness = this.changeRoundness(config.roundness, pressure)
    }
}