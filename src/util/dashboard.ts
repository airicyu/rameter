import handler from "serve-handler";
import http from "http";

/**
 * up lifting the dashboard static webpage.
 *
 * @param port
 */
export const upDashboard = (origin: string, port: number) => {
  const server = http.createServer((request, response) => {
    return handler(request, response, {
      public: "./node_modules/rameter/dashboard",
    });
  });

  server.listen(port, () => {
    console.log(`Running Dashboard at ${origin}`);
  });
};
