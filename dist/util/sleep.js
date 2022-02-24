/**
 * simple sleep function
 *
 * @param timeMs
 * @returns
 */
export const sleep = async (timeMs) => {
    return new Promise((resolve) => {
        setTimeout(resolve, timeMs);
    });
};
//# sourceMappingURL=sleep.js.map