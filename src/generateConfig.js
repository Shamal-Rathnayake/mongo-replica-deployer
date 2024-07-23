import fs from "fs";
import path from "path";
import { config as dotenvConfig } from "dotenv";
import config from "../config/config.js";
import { replicaConfigs } from "../config/replicaConfig.js";
import { execAsync } from "./deployDatabases.js";

dotenvConfig();

const baseRootPath = path.resolve(config.replica_config_path);

export const deleteBaseDirectory = async () => {
  const command =
    process.platform === "win32" ? `rmdir /s /q "${baseRootPath}"` : `rm -rf "${baseRootPath}"`;

  const { stderr } = await execAsync(command);
  if (stderr) {
    console.error(`Error deleting directory: ${stderr}`);
  }

  console.log(`Deleted: ${baseRootPath}`);
};

/* export const deleteBaseDirectory = async () => {
  try {
    const files = fs.readdirSync(baseRootPath);

    for (const file of files) {
      const filePath = path.join(baseRootPath, file);
      const stat = fs.lstatSync(filePath);

      if (stat.isDirectory()) {
        await deleteBaseDirectory(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    }

    fs.rmdirSync(baseRootPath);
    console.log(`Deleted directory: ${baseRootPath}`);
  } catch (error) {
    console.error(`Error while deleting ${baseRootPath}:`, error);
  }
};
 */
const createFileIfNotExists = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const createDirectoryIfNotExists = (filePath) => {
  const normalizedPath = path.normalize(filePath);
  if (!fs.existsSync(normalizedPath)) {
    fs.mkdirSync(normalizedPath, { recursive: true });
  }
};

const writeFile = (filePath, content) => {
  fs.writeFileSync(filePath, content.trim());
  console.log(`Configuration file generated at ${filePath}`);
};

const generateConfigContent = ({ ip, port, logPath, dbPath, replicaSetName }) => {
  return `
systemLog:
  destination: file
  path: ${logPath}
  logAppend: true
storage:
  dbPath: ${dbPath}
net:
  bindIp: ${ip}
  port: ${port}
replication:
  replSetName: ${replicaSetName}
`.trim();
};

const generateConfigFile = (name, ip, port, logPath, dbPath) => {
  const fullLogPath = path.join(baseRootPath, `logs`, `${name}`, `${logPath}`);
  createFileIfNotExists(fullLogPath);

  const fullDbPath = path.join(baseRootPath, `data`, `${name}`, `${dbPath}`);
  createDirectoryIfNotExists(fullDbPath);

  const configContent = generateConfigContent({
    ip,
    port,
    logPath: fullLogPath,
    dbPath: fullDbPath,
    replicaSetName: config.replica_set_name,
  });
  const filePath = path.join(baseRootPath, `config_files`, `${name}.conf`);

  createFileIfNotExists(filePath);
  writeFile(filePath, configContent);
};

const createConfigurations = async () => {
  try {
    replicaConfigs.forEach(({ name, ip, port, logPath, dbPath }) => {
      generateConfigFile(name, ip, port, logPath, dbPath);
    });
  } catch (error) {
    console.error("Error generating configuration files:", error);
  }
};

export default createConfigurations;
