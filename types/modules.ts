import { BrushBasicConfig } from "./config";
import { PurePoint } from './point'

export interface Module {
    onChangeConfig?(config: BrushBasicConfig, pressure: number): void;
    onChangePoint?(point: PurePoint, config: BrushBasicConfig): PurePoint | PurePoint[];
    /**
     * @returns [strokeCanvas, strokeContext]
     */
    onMergeCanvas?(showCanvas: HTMLCanvasElement, showContext: CanvasRenderingContext2D, strokeCanvas: HTMLCanvasElement, strokeContext: CanvasRenderingContext2D): [HTMLCanvasElement, CanvasRenderingContext2D];
}