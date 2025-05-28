import admin from "firebase-admin";
import path from "path";
import { envs } from "../plugins";

// const serviceAccount = require(path.resolve(
//   __dirname,
//   "../../../firebase-service-account.json"
// ));

// const serviceAccount = JSON.parse(envs.FIREBASE_CONFIG);

// // 1. Cargamos la variable del .env
// const raw = envs.FIREBASE_CONFIG!;

// // 2. La parseamos y corregimos el formato de la private_key
// const serviceAccount = JSON.parse(raw.replace(/\\n/g, '\n'));
// Leer desde base64
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_CONFIG_B64!, "base64").toString("utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export { admin };
