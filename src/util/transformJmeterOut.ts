import fs from "fs";
import * as csv from "csv";
import { stringify } from "csv-stringify";

/**
 * Transform Rameter output format to Jmeter CSV output format.
 *
 * @param inFile
 * @param outFile
 * @returns
 */
export const transformJmeterOut = async (inFile: string, outFile: string) => {
  const rs = fs.createReadStream(inFile);

  const ws = fs.createWriteStream(outFile, {
    flags: "w",
    encoding: "utf-8",
  });

  rs.pipe(
    csv.parse({
      delimiter: ",",
      columns: true,
    })
  )
    .pipe(
      csv.transform(function (record) {
        return {
          timeStamp: +record.startTime,
          elapsed: Math.round(+record.durationMs),
          label: record.label,
          responseCode: record.responseCode,
          responseMessage: record.responseMessage,
          threadName: `${record.userGroup} ${record.userId}`,
          dataType: "text",
          success: record.success === "1" ? "true" : "false",
          failureMessage: record.success === "1" ? "" : record.responseMessage,
          bytes: 0,
          sentBytes: 0,
          grpThreads: +record.groupUsers,
          allThreads: +record.allUsers,
          URL: record.label,
          Latency: +record.firstByte,
          IdleTime: 0,
          Connect: +record.connect,
        };
      })
    )
    .pipe(
      stringify({
        header: true,
        columns: [
          "timeStamp",
          "elapsed",
          "label",
          "responseCode",
          "responseMessage",
          "threadName",
          "dataType",
          "success",
          "failureMessage",
          "bytes",
          "sentBytes",
          "grpThreads",
          "allThreads",
          "URL",
          "Latency",
          "IdleTime",
          "Connect",
        ],
        quoted: false,
      })
    )
    .pipe(ws);

  return new Promise<void>((resolve) => {
    ws.on("close", () => {
      console.log("write jmeter format output done!");
      resolve();
    });
  });
};
