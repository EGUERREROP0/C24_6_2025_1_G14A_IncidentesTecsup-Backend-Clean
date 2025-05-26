import admin from "firebase-admin";
import path from "path";

const serviceAccount = require(path.resolve(
  __dirname,
  "../../../firebase-service-account.json"
));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export { admin };
