import { exec } from "child_process";
import path from "path";
import { config as dotenvConfig } from "dotenv";
import { replicaConfigs } from "../config/replicaConfig.js";
import config from "../config/config.js";
import { promisify } from "util";
import os from "os";
import readline from "readline";
import { existsSync } from "fs";
import inquirer from "inquirer";

dotenvConfig();

const baseRootPath = path.resolve(config.replica_config_path);
const platform = os.platform();

export const execAsync = promisify(exec);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

const promptPassword = async (question) => {
  return new Promise((resolve) => {
    rl.stdoutMuted = true;
    rl.question(question, (password) => {
      rl.stdoutMuted = false;
      console.log("");
      rl.close();
      resolve(password);
    });
    rl._writeToOutput = function _writeToOutput(string) {
      if (rl.stdoutMuted) rl.output.write("*");
      else rl.output.write(string);
    };
  });
};

export const execAsAdmin = async (command) => {
  let execCommand;
  if (platform === "win32") {
    execCommand = `powershell -ExecutionPolicy Bypass -File ${path.resolve(
      "./run-elevated.ps1"
    )} -Command "${command}"`;
  } else if (platform === "linux" || platform === "darwin") {
    const password = await promptPassword("Enter your sudo password: ");
    execCommand = `echo ${password} | sudo -S ${command}`;
  } else {
    console.error("Unsupported platform");
    return;
  }

  return execAsync(execCommand);
};

const deployAllDatabases = async () => {
  try {
    const databaseConfigs = replicaConfigs.map(({ name, port }) => ({
      name,
      port,
      config_path: path.join(baseRootPath, `config_files`, `${name}.conf`),
    }));

    const nodeOptions = databaseConfigs.map((config) => ({
      name: `${config.name}:${config.port}`,
      value: config.port,
    }));

    const answers = await inquirer.prompt([
      {
        type: "checkbox",
        name: "nodes",
        message: "Select databases to deploy:",
        choices: nodeOptions,
      },
    ]);

    const selectedMembers = databaseConfigs.filter((config) => answers.nodes.includes(config.port));

    for (const databaseConfig of selectedMembers) {
      if (!existsSync(databaseConfig.config_path)) {
        console.error(`Configuration file not found at ${databaseConfig.config_path}`);
        continue;
      }

      const command = `mongod --config '${databaseConfig.config_path}' ${
        platform === "linux" || platform === "darwin" ? "--fork" : ""
      }`;

      const { stdout, stderr } = await execAsAdmin(command);
      if (stderr) {
        console.error(`Error starting ${databaseConfig.name}: ${stderr}`);
        continue;
      }

      console.log(`${databaseConfig.name} started at port ${databaseConfig.port}.`);
    }
  } catch (error) {
    console.log("🚀 ~ deployAllDatabases= ~ error:", error);
  }
};

export default deployAllDatabases;
