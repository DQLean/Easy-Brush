export interface PatternConfig {
    /** Image scale (0.00-1.00) (default: 1.00) */
    scale?: number,
    /** Image opacity */
    brightness?: number,
    /** Image contrast */
    contrast?: number,
    /** Image blend mode (default: source-over) */
    blendMode?: CanvasRenderingContext2D['globalCompositeOperation'],
}

export interface PatternBasicConfig {
    /** Image scale (0.00-1.00) (default: 1.00) */
    scale: number,
    /** Image opacity */
    brightness: number,
    /** Image contrast */
    contrast: number,
    /** Image blend mode (default: source-over) */
    blendMode: CanvasRenderingContext2D['globalCompositeOperation'],
}