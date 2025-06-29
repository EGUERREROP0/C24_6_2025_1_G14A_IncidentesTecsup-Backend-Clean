// import { Server } from "http";
// import WebSocket, { WebSocketServer } from "ws";

// interface Options {
//   server: Server;
//   path?: string;
// }

// export class WssService {
//   private static _instance: WssService;
//   private wss: WebSocketServer;

//   private constructor(options: Options) {
//     const { server, path = "/ws" } = options;

//     this.wss = new WebSocketServer({ server, path });

//     this.start();
//   }

//   static get instance(): WssService {
//     if (!WssService._instance) {
//       throw "WssService is not initialized";
//     }

//     return WssService._instance;
//   }

//   static initWss(options: Options) {
//     WssService._instance = new WssService(options);
//   }

//   public emitNewIncident = (incident: any) => {
//     const payload = JSON.stringify({
//       event: "new-incident",
//       data: incident,
//     });

//     this.wss.clients.forEach((client) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(payload);
//       }
//     });
//   };

//   public emitDashboardUpdate(stats: any) {
//     const payload = JSON.stringify({
//       event: "dashboard-update",
//       data: stats,
//     });
//     console.log(`🔔 Enviando update a ${this.wss.clients.size} clientes`);
//     this.wss.clients.forEach((client) => {
//       console.log("Estado cliente:", client.readyState); // Espera 1 (OPEN)
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(payload);
//       }
//     });
//     // for (const client of this.clients) {
//     //   if (client.readyState === WebSocket.OPEN) {
//     //     client.send(payload);
//     //   }
//     // }
//   }

//   public start() {
//     this.wss.on("connection", (ws: WebSocket) => {
//       console.log("Client Connected");

//       ws.on("close", () => console.log("Cliente disconected"));
//     });
//   }
// }


// // import { Server } from "http";
// // import WebSocket, { WebSocketServer } from "ws";

// // interface Options {
// //   server: Server;
// //   path?: string;
// // }

// // export class WssService {
// //   private static _instance: WssService;
// //   private wss: WebSocketServer;
// //   private lastIncident: any = null;

// //   private constructor(options: Options) {
// //     const { server, path = "/ws" } = options;
// //     this.wss = new WebSocketServer({ server, path });
// //     this.start();
// //   }

// //   static get instance(): WssService {
// //     if (!WssService._instance) {
// //       throw "WssService is not initialized";
// //     }
// //     return WssService._instance;
// //   }

// //   static initWss(options: Options) {
// //     WssService._instance = new WssService(options);
// //   }

// //   public emitNewIncident = (incident: any) => {
// //     this.lastIncident = incident;

// //     const payload = JSON.stringify({
// //       event: "new-incident",
// //       data: incident,
// //     });

// //     if (this.wss.clients.size > 0) {
// //       console.log(
// //         `📢 Enviando incidente a ${this.wss.clients.size} cliente(s)`
// //       );
// //       this.wss.clients.forEach((client) => {
// //         if (client.readyState === WebSocket.OPEN) {
// //           client.send(payload);
// //         }
// //       });
// //     } else {
// //       console.log("🕸️ No hay clientes conectados");
// //     }
// //   };

// //   public emitDashboardUpdate(stats: any) {
// //     const payload = JSON.stringify({
// //       event: "dashboard-update",
// //       data: stats,
// //     });

// //     if (this.wss.clients.size > 0) {
// //       console.log(
// //         `📊 Actualización de dashboard enviada a ${this.wss.clients.size} cliente(s)`
// //       );
// //       this.wss.clients.forEach((client) => {
// //         if (client.readyState === WebSocket.OPEN) {
// //           client.send(payload);
// //         }
// //       });
// //     } else {
// //       console.log("📭 No hay clientes para actualizar el dashboard");
// //     }
// //   }

// //   public start() {
// //     this.wss.on("connection", (ws: WebSocket) => {
// //       console.log("✅ Cliente conectado a WebSocket");

// //       // Enviar el último incidente si existe
// //       if (this.lastIncident) {
// //         ws.send(
// //           JSON.stringify({
// //             event: "new-incident",
// //             data: this.lastIncident,
// //           })
// //         );
// //       }

// //       // Escuchar mensajes opcionales del frontend
// //       ws.on("message", (message) => {
// //         try {
// //           const parsed = JSON.parse(message.toString());
// //           if (parsed.event === "join") {
// //             console.log(
// //               `🔓 Cliente identificado como: ${
// //                 parsed.data?.source || "sin etiqueta"
// //               }`
// //             );
// //           }
// //         } catch (err) {
// //           console.error("❌ Error al parsear mensaje:", message.toString());
// //         }
// //       });

// //       ws.on("close", () => {
// //         console.log("❌ Cliente desconectado");
// //       });
// //     });
// //   }
// // }


import { Server, Socket } from "socket.io";

let ioInstance: Server;

export const setupSocketHandlers = (io: Server) => {
  ioInstance = io;

  io.on("connection", (socket: Socket) => {
    console.log("🟢 Cliente conectado:", socket.id);

    socket.on("join", (data) => {
      console.log("Cliente se unió con etiqueta:", data?.source || "anónimo");
    });

    socket.on("disconnect", () => {
      console.log("🔴 Cliente desconectado:", socket.id);
    });
  });
};

export const SocketIOService = {
  emitNewIncident: (incident: any) => {
    ioInstance?.emit("new-incident", incident);
  },

  emitDashboardUpdate: (stats: any) => {
    ioInstance?.emit("dashboard-update", stats);
  },
};
