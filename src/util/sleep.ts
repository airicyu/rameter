/**
 * simple sleep function
 *
 * @param timeMs
 * @returns
 */
export const sleep = async (timeMs: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeMs);
  });
};
