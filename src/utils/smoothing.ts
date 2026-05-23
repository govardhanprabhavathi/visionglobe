/**
 * Linearly interpolates between two values.
 * @param start Start value
 * @param end End value
 * @param amount The amount to interpolate (0.0 to 1.0)
 * @returns Interpolated value
 */
export const lerp = (start: number, end: number, amount: number) => {
  return (1 - amount) * start + amount * end;
};

/**
 * Calculates distance between two points in 2D space.
 */
export const distance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.hypot(x2 - x1, y2 - y1);
};
