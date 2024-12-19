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

export class DynamicTransparencyModule {
    /** module config */
    config: DynamicTransparencyBasicConfig = defaultConfig;

    constructor(config?: DynamicTransparencyConfig) {
        if (config?.opacityJitter != void 0 && config?.opacityJitter != null) this.config.opacityJitter = config.opacityJitter;
        if (config?.opacityJitterTrigger != void 0 && config?.opacityJitterTrigger != null) this.config.opacityJitterTrigger = config.opacityJitterTrigger;
        if (config?.minOpacityJitter != void 0 && config?.minOpacityJitter != null) this.config.minOpacityJitter = config.minOpacityJitter;
        if (config?.flowJitter != void 0 && config?.flowJitter != null) this.config.flowJitter = config.flowJitter;
        if (config?.flowJitterTrigger != void 0 && config?.flowJitterTrigger != null) this.config.flowJitterTrigger = config.flowJitterTrigger;
        if (config?.minFlowJitter != void 0 && config?.minFlowJitter != null) this.config.minFlowJitter = config.minFlowJitter;
    }

    /**
     * Bind config to brush. 
     * 
     * If you do this, the brush config will change with the external config
     */
    bindConfig(config: DynamicTransparencyBasicConfig) {
        this.config = config
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