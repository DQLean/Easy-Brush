export interface DynamicTransparencyBasicConfig {
    opacityJitter: number,
    opacityJitterTrigger: "none" | "pressure",
    minOpacityJitter: number,
    flowJitter: number,
    flowJitterTrigger: "none" | "pressure",
    minFlowJitter: number,
}

export interface DynamicTransparencyConfig {
    opacityJitter?: number,
    opacityJitterTrigger?: "none" | "pressure",
    minOpacityJitter?: number,
    flowJitter?: number,
    flowJitterTrigger?: "none" | "pressure",
    minFlowJitter?: number,
}