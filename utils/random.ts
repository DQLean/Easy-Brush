export const randomRound = (min: number, max: number, accuracy: number = 1) => {
    return Math.floor(Math.random() * (max * accuracy - min * accuracy + 1) + min * accuracy) / accuracy;
}

/**
 * Normal Distribution Random
 */
export const randomND = (mean: number, stdDev: number) => {
    let u, v, w
    do {
        u = Math.random() * 2 - 1.0;
        v = Math.random() * 2 - 1.0;
        w = u * u + v * v;
    } while (w == 0.0 || w >= 1.0)
    const c = Math.sqrt((-2 * Math.log(w)) / w);
    return mean + (u * c) * stdDev
}