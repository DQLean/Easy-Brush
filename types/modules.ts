import { BrushBasicConfig } from "./config";

export interface Module {
    onChangeConfig?(config: BrushBasicConfig, pressure: number): void;
}