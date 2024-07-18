import { BrushBasicConfig } from "./config";
import { PurePoint } from './point'

export interface Module {
    onChangeConfig?(config: BrushBasicConfig, pressure: number): void;
    onChangePoint?(point: PurePoint, config: BrushBasicConfig): PurePoint | PurePoint[];
}