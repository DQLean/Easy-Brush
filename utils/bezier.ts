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