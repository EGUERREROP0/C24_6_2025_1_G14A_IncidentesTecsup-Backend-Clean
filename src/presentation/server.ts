import express, { Router } from "express";
import cors from "cors";
import path from "path";

interface Options {
  routes: Router;
  port: number;
  publicPath: string;
}

export class Server {
  public readonly app = express();
  public readonly routes: Router;
  public readonly port: number;
  public readonly publicPath: string;

  constructor(options: Options) {
    const { routes, port, publicPath } = options;

    this.routes = routes;
    this.port = port;
    this.publicPath = publicPath;
  }

  public start() {
    //* Middlewares
    this.app.use(express.json()); //Permitir extencion row
    this.app.use(express.urlencoded({ extended: true })); //x-www-form -urencoded

    this.app.use(cors()); //Prevent block of cors

    //* Public Folders
    this.app.use(express.static(this.publicPath));

    //* Routes
    this.app.use(this.routes);

    //* Helps SPA
    this.app.get("*", (req, res) => {
      const indexPath = path.join(
        __dirname + `../../../${this.publicPath}/index.html`
      );
      res.sendFile(indexPath);
    });

    //* Listening
    this.app.listen(this.port, () => {
      console.log(`The server is running in port:${this.port}`);
    });
  }
}
