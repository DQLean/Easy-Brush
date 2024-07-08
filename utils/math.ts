/**
 * Calculate the distance between two points in pixels
 */
export const getDistance = (p1x: number, p1y: number, p2x: number, p2y: number) => {
    return Math.sqrt(Math.pow(p2x - p1x, 2) + Math.pow(p2y - p1y, 2));
}

/**
 * Calculate the angle between the line connecting two points and the x-axis
 */
export const getAngle = (p1x: number, p1y: number, p2x: number, p2y: number) => {
    return Math.atan2(p2y - p1y, p2x - p1x);
}

/**
 * Obtain the coordinates of a certain point on a line composed of two points
 * 
 * Swapping positions from point 1 to point 2 will result in different results. 
 * The concept of t is to draw a straight line from point 1 to point 2 and go to the coordinates at the length of t
 */
export const getPointBetween = (p1x: number, p1y: number, p2x: number, p2y: number, t: number) => {
    if (t === void 0) {
        return {
            x: (p1x + p2x) / 2,
            y: (p1y + p2y) / 2
        };
    } else {
        return {
            x: p1x + (p2x - p1x) * t,
            y: p1y + (p2y - p1y) * t
        };
    }
}

/**
 * Splitting decimals into 'unit'. unit defaults to 1
 * 
 * @example
 * splitDecimal(3.2) // [1, 1, 1, 0.2]
 * splitDecimal(4.1, 2) // [2, 2, 0.1]
 * splitDecimal(4, 3) // [3, 1]
 */
export const splitDecimal = (num: number, unit: number = 1) => {
    const result = [];
    const wholePart = Math.floor(num / unit);
    const decimalPart = num - wholePart * unit;
    for (let i = 0; i < wholePart; i++) {
        result.push(unit);
    }
    if (decimalPart > 0) {
        result.push(decimalPart);
    }
    return result;
}

/**
 * Digital convergence
 * 
 * Shrink num between min max, if it exceeds or falls below, the maximum/minimum value will be taken
 * 
 * @example
 * clamp(5, 1, 3) // 3
 * clamp(2, 1, 3) // 2
 */
export const clamp = (num: number, min: number, max: number) => {
    return Math.min(Math.max(num, min), max);
}

/**
 * Digital convergence
 * 
 * Shrink num between 0 and max, take the remainder if it exceeds 0, 
 * and take the difference between its absolute value and max if it is less than 0
 * 
 * @example
 * wrap(5, 3) // 2
 * wrap(-5, 3) // 2
 * wrap(2, 3) // 2
 */
export const wrap = (num: number, max: number) => {
    if (num < 0) {
        return num - Math.floor(num / max) * max;
    } else if (num > max) {
        return num - Math.floor(num / max) * max;
    } else {
        return num;
    }
}