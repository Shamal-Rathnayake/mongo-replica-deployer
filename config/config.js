import { config as dotenvConfig } from "dotenv";
dotenvConfig();

const config = {
  replica_set_name: process.env.REPLICA_SET_NAME,
  replica_config_path: process.env.REPLICA_CONFIG_PATH,
  default_mongodb_port: process.env.DEFAULT_MONGO_PORT,
};

export default config;
