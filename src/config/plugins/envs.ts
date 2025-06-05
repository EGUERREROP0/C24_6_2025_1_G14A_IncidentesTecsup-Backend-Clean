import env from "env-var";

import "dotenv/config";

export const envs = {
  PORT: env.get("PORT").required().asPortNumber(),
  PUBLIC_PATHc: env.get("PUBLIC_PATH").default("public").asString(),

  //CONFIG DATABASE POSTGRESQL
  POSTGRES_USER: env.get("POSTGRES_USER").required().asString(),
  POSTGRES_DB: env.get("POSTGRES_DB").required().asString(),
  POSTGRES_PASSWORD: env.get("POSTGRES_PASSWORD").required().asString(),
  POSTGRES_PORT: env.get("POSTGRES_PORT").required().asPortNumber(),

  //jwt_token
  JWT_SEED: env.get("JWT_SEED").required().asString(),

  //CONFIG CLOUDINARY
  CLOUDINARY_CLOUD_NAME: env.get("CLOUDINARY_CLOUD_NAME").required().asString(),
  CLOUDINARY_API_KEY: env.get("CLOUDINARY_API_KEY").required().asString(),
  CLOUDINARY_API_SECRET: env.get("CLOUDINARY_API_SECRET").required().asString(),

  API_OPENIA: env.get("API_OPENIA").required().asString(),

  //CONFIG FIREBASE
  FIREBASE_CONFIG_B64: env.get("FIREBASE_CONFIG_B64").required().asString(),

  //CONFIG MAILER
  MAILER_SERVICE: env.get("MAILER_SERVICE").required().asString(),
  MAILER_EMAIL: env.get("MAILER_EMAIL").required().asString(),
  MAILER_SECRET_KEY: env.get("MAILER_SECRET_KEY").required().asString(),

  //LocalHost
  API_URL: env.get("API_URL").required().asString(),
  API_URL_FRONTEND: env.get("API_URL_FRONTEND").required().asString(),
};
