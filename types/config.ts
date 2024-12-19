export interface BrushBasicConfig {
    size: number
    /** 0.00-1.00 */
    opacity: number
    /** 0.00-1.00 */
    flow: number
    color: string
    /** 0.00-1.00 */
    angle: number
    /** 0.00-1.00 */
    roundness: number
    /** 0.00-1.00 or 1.00-infinite (If your computer is great enough XD) */
    spacing: number
}

export interface BrushConfig {
    size?: number
    opacity?: number
    flow?: number
    color?: string
    angle?: number
    roundness?: number
    spacing?: number
}
