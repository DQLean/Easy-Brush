import { BrushBasicConfig } from '../types/config';
import { DynamicTransparencyConfig, DynamicTransparencyBasicConfig } from '../types/dynamicTransparency'
import { clamp } from '../utils/math';
import { randomRound } from '../utils/random';

const defaultConfig: DynamicTransparencyBasicConfig = {
    opacityJitter: 0.00,
    opacityJitterTrigger: "none",
    minOpacityJitter: 0.00,
    flowJitter: 0.00,
    flowJitterTrigger: "none",
    minFlowJitter: 0.00,
}

export class DynamicTransparency {
    private config: DynamicTransparencyBasicConfig = defaultConfig;

    constructor(config?: DynamicTransparencyConfig) {
        this.config = { ...defaultConfig, ...config };
    }

    private changeOpacity(opacity: number, pressure: number): number {
        let newOpacity = opacity;
        if (this.config.opacityJitterTrigger === "pressure") {
            newOpacity = newOpacity * (pressure * 2)
        }

        const jitterValue = newOpacity * this.config.opacityJitter
        newOpacity = clamp(randomRound(newOpacity - jitterValue, newOpacity, 100), 0, 1)

        if (newOpacity < this.config.minOpacityJitter * opacity) {
            newOpacity = this.config.minOpacityJitter * opacity
        }

        return newOpacity
    }

    private changeFlow(flow: number, pressure: number): number {
        let newFlow = flow
        if (this.config.flowJitterTrigger === "pressure") {
            newFlow = newFlow * (pressure * 2)
        }

        const jitterValue = newFlow * this.config.flowJitter
        newFlow = clamp(randomRound(newFlow - jitterValue, newFlow, 100), 0, 1)

        if (newFlow < this.config.minFlowJitter * flow) {
            newFlow = this.config.minFlowJitter * flow
        }

        return newFlow
    }

    onChangeConfig(config: BrushBasicConfig, pressure: number) {
        config.opacity = this.changeOpacity(config.opacity, pressure)
        config.flow = this.changeFlow(config.flow, pressure)
    }
}