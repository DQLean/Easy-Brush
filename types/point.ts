import { BrushBasicConfig } from "./config";

export interface PurePoint {
    x: number,
    y: number,
    pressure: number,
}

export interface Point extends PurePoint {
    config: BrushBasicConfig,
    strokeEnd?: boolean,
    callback?: PointCallBack
}

export type PointCallBack = () => void;