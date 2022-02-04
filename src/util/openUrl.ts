import { platform } from "os";
import { exec } from "child_process";

const WINDOWS_PLATFORM = "win32";
const MAC_PLATFORM = "darwin";
const osPlatform = platform();

export const openUrl = async (url: string) => {
  let command = "";

  if (osPlatform === WINDOWS_PLATFORM) {
    command = `start ${url}`;
  } else if (osPlatform === MAC_PLATFORM) {
    command = `open -a "Google Chrome" ${url}`;
  } else {
    command = `google-chrome --no-sandbox ${url}`;
  }

  return new Promise<void>((resolve, reject) => {
    exec(command, (error) => {
      if (error) {
        return reject(error);
      } else {
        return resolve();
      }
    });
  });
};
