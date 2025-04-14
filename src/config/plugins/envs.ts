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
};
