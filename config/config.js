import { config as dotenvConfig } from "dotenv";
dotenvConfig();

const config = {
  replica_1_name: process.env.MONGOD1_NAME,
  replica_1_ip: process.env.MONGOD1_IP,
  replica_1_port: process.env.MONGOD1_PORT,
  replica_1_log_path: process.env.MONGOD1_LOG_PATH,
  replica_1_db_path: process.env.MONGOD1_DB_PATH,

  replica_2_name: process.env.MONGOD2_NAME,
  replica_2_ip: process.env.MONGOD2_IP,
  replica_2_port: process.env.MONGOD2_PORT,
  replica_2_log_path: process.env.MONGOD2_LOG_PATH,
  replica_2_db_path: process.env.MONGOD2_DB_PATH,

  replica_3_name: process.env.MONGOD3_NAME,
  replica_3_ip: process.env.MONGOD3_IP,
  replica_3_port: process.env.MONGOD3_PORT,
  replica_3_log_path: process.env.MONGOD3_LOG_PATH,
  replica_3_db_path: process.env.MONGOD3_DB_PATH,

  arbiter_ip: process.env.ARBITER_IP,
  arbiter_port: process.env.ARBITER_PORT,
  arbiter_log_path: process.env.ARBITER_LOG_PATH,
  arbiter_db_path: process.env.ARBITER_DB_PATH,

  replica_set_name: process.env.REPLICA_SET_NAME,

  replica_config_path: process.env.REPLICA_CONFIG_PATH,

  default_mongodb_port: process.env.DEFAULT_MONGO_PORT,
};

export default config;
