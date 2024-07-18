export interface SpreadBasicConfig {
    spreadRange: number,
    spreadTrigger: "none" | "pressure",
    count: number,
    countJitter: number,
    countJitterTrigger: "none" | "pressure",
}

export interface SpreadConfig {
    spreadRange?: number,
    spreadTrigger?: "none" | "pressure",
    count?: number,
    countJitter?: number,
    countJitterTrigger?: "none" | "pressure",
}