import { envs } from "./config/plugins/envs";
import { AppRoutes } from "./presentation/routes";
import { Server } from "./presentation/server";

(() => {
  main();
})();

function main() {
  const server = new Server({
    routes: AppRoutes.routes,
    port: envs.PORT,
    publicPath: envs.PUBLIC_PATHc,
  });

  server.start();
}
