import config from "./config.js";

export const replicaConfigs = [
  {
    name: config.replica_1_name,
    ip: config.replica_1_ip,
    port: config.replica_1_port,
    logPath: config.replica_1_log_path,
    dbPath: config.replica_1_db_path,
    is_arbiter: false,
  },
  {
    name: config.replica_2_name,
    ip: config.replica_2_ip,
    port: config.replica_2_port,
    logPath: config.replica_2_log_path,
    dbPath: config.replica_2_db_path,
    is_arbiter: false,
  },
  {
    name: config.replica_3_name,
    ip: config.replica_3_ip,
    port: config.replica_3_port,
    logPath: config.replica_3_log_path,
    dbPath: config.replica_3_db_path,
    is_arbiter: false,
  },
  {
    name: "arbiter",
    ip: config.arbiter_ip,
    port: config.arbiter_port,
    logPath: config.arbiter_log_path,
    dbPath: config.arbiter_db_path,
    is_arbiter: true,
  },
];
