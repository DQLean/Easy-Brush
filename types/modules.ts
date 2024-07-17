import { BrushBasicConfig } from "./config";
import { PurePoint } from "./point";

export interface Module {
    onChangeConfig?(config: BrushBasicConfig, point: PurePoint): void;
}