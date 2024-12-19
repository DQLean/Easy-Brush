import { getDistance } from "./math";

/**
 * 将二阶贝塞尔曲线等距分割。
 * @param {number} p1x 起点x
 * @param {number} p1y 起点y
 * @param {number} ptx 控制点x
 * @param {number} pty 控制点y
 * @param {number} p2x 终点x
 * @param {number} p2y 终点y
 * @param space - 指定的点之间的距离。
 * @returns 分割点的坐标数组。
 */
export const getEquidistantBezierPoints = (p1x: number, p1y: number, ptx: number, pty: number, p2x: number, p2y: number, space: number) => {
  const points: {x: number, y: number}[] = [];
  const totalLength = getQuadraticBezierDistance(p1x, p1y, ptx, pty, p2x, p2y);
  let accumulatedLength = 0;
  let t = 0;
  let prevPoint = {x: p1x, y: p1y};
  // points.push(prevPoint); // 起始点

  while (accumulatedLength + space <= totalLength) {
    let currentT = t;
    let currentPoint = quadraticBezier(currentT, p1x, p1y, ptx, pty, p2x, p2y);

    // 调整 t 值找到下一个等距点
    while (getDistance(prevPoint.x, prevPoint.y, currentPoint.x, currentPoint.y) < space && currentT <= 1) {
      currentT += 0.001; // 调整步长可以提高精度
      currentPoint = quadraticBezier(currentT, p1x, p1y, ptx, pty, p2x, p2y);
    }

    if (currentT <= 1) {
      points.push(currentPoint);
      accumulatedLength += space;
      t = currentT;
      prevPoint = currentPoint;
    } else {
      break;
    }
  }

  return points;
}

/**
 * 计算二次贝塞尔曲线的近似长度。
 * @param {number} p1x 起点x
 * @param {number} p1y 起点y
 * @param {number} ptx 控制点x
 * @param {number} pty 控制点y
 * @param {number} p2x 终点x
 * @param {number} p2y 终点y
 * @param numSegments - 精度，即曲线被分成多少段来近似计算长度，值越大计算结果越精确，但计算量也越大。
 * @returns 二次贝塞尔曲线的近似长度。
 */
export const getQuadraticBezierDistance = (p1x: number, p1y: number, ptx: number, pty: number, p2x: number, p2y: number, numSegments: number = 100): number => {
  let length = 0;
  let prevPoint = { x: p1x, y: p1y };
  for (let i = 1; i <= numSegments; i++) {
    const t = i / numSegments;
    const currentPoint = quadraticBezier(t, p1x, p1y, ptx, pty, p2x, p2y);
    length += getDistance(prevPoint.x, prevPoint.y, currentPoint.x, currentPoint.y)
    prevPoint = currentPoint;
  }
  return length;
}


/**
 * 二次贝塞尔计算
 * @param {number} t 0-1 点位于线段中的位置
 * @param {number} p1x 起点x
 * @param {number} p1y 起点y
 * @param {number} ptx 控制点x
 * @param {number} pty 控制点y
 * @param {number} p2x 终点x
 * @param {number} p2y 终点y
 * @returns 
 */
export const quadraticBezier = (t: number, p1x: number, p1y: number, ptx: number, pty: number, p2x: number, p2y: number) => {
  const x = (1 - t) * (1 - t) * p1x + 2 * (1 - t) * t * ptx + t * t * p2x;
  const y = (1 - t) * (1 - t) * p1y + 2 * (1 - t) * t * pty + t * t * p2y;
  return { x, y };
}

/**
 * 获取两点之间贝塞尔控制点(一个)
 * 
 * @param {number} p1x 终点x
 * @param {number} p1y 终点y
 * @param {number} p2x 起点x
 * @param {number} p2y 起点y
 * @param {number} p3x 起点前一个点x
 * @param {number} p3y 起点前一个点y
 * @param {number} ratio 0-1 默认0.25
 * @returns 
 */
export const getControlPoint = (p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number, ratio: number = 0.25) => {
  return {
    x: p2x + (p1x - p3x) * ratio,
    y: p2y + (p1y - p3y) * ratio,
  }
}

/**
 * 获取两点之间贝塞尔控制点(共两个)
 * 
 * @param {number} p1x 终点x
 * @param {number} p1y 终点y
 * @param {number} p2x 起点x
 * @param {number} p2y 起点y
 * @param {number} p3x 起点前一个点x
 * @param {number} p3y 起点前一个点y
 * @param {number} ratio 0-1 默认0.25
 * @returns 
 */
export const getAllControlPoint = (p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number, ratio: number = 0.25) => {
  const cA = {
    x: p2x + (p1x - p3x) * ratio,
    y: p2y + (p1y - p3y) * ratio,
  }
  const cB = {
    x: p1x - (p1x - p2x) * ratio,
    y: p1y - (p1y - p2y) * ratio,
  }

  return [cA, cB]
}


/**
 * 使用二分法找到对应于给定弧长的参数t值。
 * @param {number} p1x 起点x
 * @param {number} p1y 起点y
 * @param {number} ptx 控制点x
 * @param {number} pty 控制点y
 * @param {number} p2x 终点x
 * @param {number} p2y 终点y
 * @param targetLength - 目标弧长。
 * @param tolerance - 容差。
 * @returns 对应于给定弧长的参数t值。
 */
export const findTForLength = (p1x: number, p1y: number, ptx: number, pty: number, p2x: number, p2y: number, targetLength: number, tolerance: number = 0.001): number => {
  let low = 0;
  let high = 1;
  let mid = (low + high) / 2;

  while (high - low > tolerance) {
    mid = (low + high) / 2;
    const length = getQuadraticBezierDistance(mid, p1x, p1y, ptx, pty, p2x, p2y);

    if (length < targetLength) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return mid;
}