import { config as dotenvConfig } from "dotenv";
dotenvConfig();

export const replicaConfigs = [
  {
    name: process.env.MONGOD1_NAME,
    ip: process.env.MONGOD1_IP,
    port: process.env.MONGOD1_PORT,
    logPath: process.env.MONGOD1_LOG_PATH,
    dbPath: process.env.MONGOD1_DB_PATH,
    is_arbiter: false,
  },
  {
    name: process.env.MONGOD2_NAME,
    ip: process.env.MONGOD2_IP,
    port: process.env.MONGOD2_PORT,
    logPath: process.env.MONGOD2_LOG_PATH,
    dbPath: process.env.MONGOD2_DB_PATH,
    is_arbiter: false,
  },
  {
    name: process.env.MONGOD3_NAME,
    ip: process.env.MONGOD3_IP,
    port: process.env.MONGOD3_PORT,
    logPath: process.env.MONGOD3_LOG_PATH,
    dbPath: process.env.MONGOD3_DB_PATH,
    is_arbiter: false,
  },
  {
    name: "arbiter",
    ip: process.env.ARBITER_IP,
    port: process.env.ARBITER_PORT,
    logPath: process.env.ARBITER_LOG_PATH,
    dbPath: process.env.ARBITER_DB_PATH,
    is_arbiter: true,
  },
];
