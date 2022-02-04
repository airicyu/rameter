export const sleep = async (timeMs: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeMs);
  });
};
