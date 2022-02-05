import handler from "serve-handler";
import http from "http";

/**
 * up lifting the dashboard static webpage.
 *
 * @param port
 */
export const upDashboard = (port: number) => {
  const server = http.createServer((request, response) => {
    return handler(request, response, {
      public: "./node_modules/rameter/dashboard",
    });
  });

  server.listen(port, () => {
    console.log(`Running Dashboard at http://127.0.0.1:${port}`);
  });
};
