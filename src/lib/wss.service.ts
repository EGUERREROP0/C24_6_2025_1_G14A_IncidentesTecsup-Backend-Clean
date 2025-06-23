import { Server } from "http";
import WebSocket, { WebSocketServer } from "ws";

interface Options {
  server: Server;
  path?: string;
}

export class WssService {
  private static _instance: WssService;
  private wss: WebSocketServer;

  private constructor(options: Options) {
    const { server, path = "/ws" } = options;

    this.wss = new WebSocketServer({ server, path });

    this.start();
  }

  static get instance(): WssService {
    if (!WssService._instance) {
      throw "WssService is not initialized";
    }

    return WssService._instance;
  }

  static initWss(options: Options) {
    WssService._instance = new WssService(options);
  }

  public emitNewIncident = (incident: any) => {
    const payload = JSON.stringify({
      event: "new-incident",
      data: incident,
    });

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  };

  public emitDashboardUpdate(stats: any) {
    const payload = JSON.stringify({
      event: "dashboard-update",
      data: stats,
    });
    
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
    // for (const client of this.clients) {
    //   if (client.readyState === WebSocket.OPEN) {
    //     client.send(payload);
    //   }
    // }
  }

  public start() {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("Client Connected");

      ws.on("close", () => console.log("Cliente disconected"));
    });
  }
}
