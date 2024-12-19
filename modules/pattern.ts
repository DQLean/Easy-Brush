import { PatternBasicConfig } from "../types/pattern";

const defaultConfig: PatternBasicConfig = {
    resource: document.createElement('canvas'),
    scale: 1.00,
    brightness: 0,
    contrast: 0,
    blendMode: "source-over",
}

export class PatternModule {
    /** module config */
    config: PatternBasicConfig = defaultConfig;

    constructor(config?: PatternBasicConfig) {
        if (config?.resource != void 0 && config?.resource != null) this.config.resource = config.resource;
        if (config?.scale != void 0 && config?.scale != null) this.config.scale = config.scale;
        if (config?.brightness != void 0 && config?.brightness != null) this.config.brightness = config.brightness;
        if (config?.contrast != void 0 && config?.contrast != null) this.config.contrast = config.contrast;
        if (config?.blendMode != void 0 && config?.blendMode != null) this.config.blendMode = config.blendMode;
    }

    /**
     * Bind config to brush. 
     * 
     * If you do this, the brush config will change with the external config
     */
    bindConfig(config: PatternBasicConfig) {
        this.config = config
    }

    
}