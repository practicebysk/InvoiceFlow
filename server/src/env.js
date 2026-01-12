import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  mongo: process.env.MONGO_URI,
  jwtAccess: process.env.JWT_ACCESS_SECRET,
  jwtRefresh: process.env.JWT_REFRESH_SECRET,
  client: process.env.CLIENT_ORIGIN,
  nodeEnv: process.env.NODE_ENV || "development",
};
