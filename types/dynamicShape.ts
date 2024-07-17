export interface DynamicShapeBasicConfig {
    sizeJitter: number,
    sizeJitterTrigger: "none" | "pressure",
    minDiameter: number,
    angleJitter: number,
    angleJitterTrigger: "none" | "pressure",
    roundJitter: number,
    roundJitterTrigger: "none" | "pressure",
    minRoundness: number,
}

export interface DynamicShapeConfig {
    sizeJitter?: number,
    sizeJitterTrigger?: "none" | "pressure",
    minDiameter?: number,
    angleJitter?: number,
    angleJitterTrigger?: "none" | "pressure",
    roundJitter?: number,
    roundJitterTrigger?: "none" | "pressure",
    minRoundness?: number,
}