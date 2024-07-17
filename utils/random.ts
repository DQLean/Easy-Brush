export const randomRound = (min: number, max: number, accuracy: number = 1) => {
    return Math.floor(Math.random() * (max * accuracy - min * accuracy + 1) + min * accuracy) / accuracy;
}