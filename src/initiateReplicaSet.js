import config from "../config/config.js";
import { replicaConfigs } from "../config/replicaConfig.js";
import { execAsAdmin, execAsync } from "./deployDatabases.js";

const attemptConnection = async (port) => {
  try {
    const mongoCommand = `mongosh --port ${port} --eval 'JSON.stringify(rs.status())'`;

    const { stdout, stderr } = await execAsync(mongoCommand);

    if (stderr) throw new Error(stderr);
    return JSON.parse(stdout);
  } catch (error) {
    if (error.message.includes("MongoNetworkError: connect ECONNREFUSED")) {
      console.log(`Connection refused on port ${port}.`);
    } else {
      console.error(`Error executing command on port ${port}:` /* , error */);
    }
    return null;
  }
};
const getReplicaStatus = async () => {
  const ports = replicaConfigs.map((config) => config.port);
  let cmdOutput = null;
  for (const port of ports) {
    cmdOutput = await attemptConnection(port);
    if (cmdOutput?.set) break;
  }
  return cmdOutput;
};

export const getReplicaMembers = async (attempt = 1) => {
  try {
    const commandOutput = await getReplicaStatus();

    const replicaMembers =
      commandOutput.members?.map(({ _id, name, stateStr, health, state }) => ({
        _id,
        name,
        stateStr,
        health,
        state,
      })) || [];

    const primaryMember = replicaMembers.find((member) => member.state === 1);

    if (!primaryMember) {
      const maxAttempts = 10;

      if (attempt < maxAttempts) {
        console.log(`Searching for primary node, please wait... Attempt ${attempt}/${maxAttempts}`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return getReplicaMembers(attempt + 1);
      } else {
        console.error("Failed to find primary member after several attempts.");
        return { primaryMember: null, replicaMembers };
      }
    } else {
      return { primaryMember: primaryMember || null, replicaMembers };
    }
  } catch (error) {
    console.error(`Exception occurred: ${error.message}`);
  }
};

export const handleWriteConcern = async (primaryPort, majority = true) => {
  const mongoCommand = `mongosh --port ${primaryPort} --eval 'db.adminCommand({
  setDefaultRWConcern: 1,
  defaultWriteConcern: {
    w: ${majority ? "majority" : "1"},
    wtimeout: 10000
  }
})'`;

  const { stderr } = await execAsAdmin(mongoCommand);
  if (stderr) {
    console.error(`Error setting write concern: ${stderr}`);
    return;
  }

  console.log(`Write concern set successfully`);
};

const initiateReplicaSet = async () => {
  try {
    const members = replicaConfigs.map(({ ip, port, is_arbiter }, index) => ({
      _id: index,
      host: `\`${ip}:${port}\``,
      arbiterOnly: is_arbiter,
    }));

    const mongoCommand = `mongosh --port ${replicaConfigs[0].port} --eval 'rs.initiate({ _id: \`${
      config.replica_set_name
    }\`, members: ${JSON.stringify(members).replace(/"/g, "")} });'`;

    const { stderr } = await execAsAdmin(mongoCommand);
    if (stderr) {
      console.error(`Error initiating replica set: ${stderr}`);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const { primaryMember } = await getReplicaMembers();

    if (!primaryMember) {
      console.log(`Replica set initiated but failed to locate primary node`);
      return;
    }

    await handleWriteConcern(primaryMember.name.split(":")[1]);

    console.log(`Replica set initiated successfully`);
  } catch (error) {
    console.log("🚀 ~ initiateReplicaSet ~ error:", error);
  }
};

export default initiateReplicaSet;
