import { createServer } from "http";
import { envs } from "./config/plugins/envs";
import { AppRoutes } from "./presentation/routes";
import { Server } from "./presentation/server";
import { WssService } from "./lib/wss.service";

(() => {
  main();
})();

function main() {
  const server = new Server({
    // routes: AppRoutes.routes,
    port: envs.PORT,
    publicPath: envs.PUBLIC_PATHc,
  });

  const httpServer = createServer(server.app);
  WssService.initWss({ server: httpServer });

  //Inicializando rutas
  server.setRoutes(AppRoutes.routes);

  //* Listening
  httpServer.listen(envs.PORT, () => {
    console.log(`The server is running in port:${envs.PORT}`);
  });

  // server.start();
}
