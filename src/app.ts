import { createServer } from "http";
import { envs } from "./config/plugins/envs";
import { AppRoutes } from "./presentation/routes";
import { Server } from "./presentation/server";
import { setupSocketHandlers } from "./lib/wss.service";
// import { WssService } from "./lib/wss.service";
import { Server as SocketIOServer } from "socket.io";

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
  // WssService.initWss({ server: httpServer });

  //* Aquí inicializamos socket.io
  const io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: {
      origin: "*", // o define dominio específico en producción
    },
  });

  //* Configura la lógica de sockets
  setupSocketHandlers(io);

  //Inicializando rutas
  server.setRoutes(AppRoutes.routes);

  //* Listening
  httpServer.listen(envs.PORT, () => {
    console.log(`The server is running in port:${envs.PORT}`);
  });

  // server.start();
}

// import { createServer } from "http";
// import { envs } from "./config/plugins/envs";
// import { AppRoutes } from "./presentation/routes";
// import { Server } from "./presentation/server";
// import { WssService } from "./lib/wss.service";

// (() => {
//   main();
// })();

// function main() {
//   const server = new Server({
//     // routes: AppRoutes.routes,
//     port: envs.PORT,
//     publicPath: envs.PUBLIC_PATHc,
//   });

//   const httpServer = createServer(server.app);
//   WssService.initWss({ server: httpServer });

//   //Inicializando rutas
//   server.setRoutes(AppRoutes.routes);

//   //* Listening
//   httpServer.listen(envs.PORT, () => {
//     console.log(`The server is running in port:${envs.PORT}`);
//   });

//   // server.start();
// }
