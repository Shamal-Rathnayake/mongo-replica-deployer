import inquirer from "inquirer";
import config from "../config/config.js";
import { replicaConfigs } from "../config/replicaConfig.js";
import { execAsAdmin, execAsync } from "./deployDatabases.js";
import { getReplicaMembers, handleWriteConcern } from "./initiateReplicaSet.js";
import { deleteBaseDirectory } from "./generateConfig.js";

const shutdownServer = async (port) => {
  try {
    const mongoCommand = `mongosh --port ${port} --eval "db.shutdownServer({force: true})"`;

    const { stderr } = await execAsync(mongoCommand);

    if (stderr) {
      console.error(`Error shutting down ${port}: ${stderr}`);
      return;
    }

    console.log(`successfully shutdown ${port} from ${config.replica_set_name}`);
  } catch (error) {
    if (error.message.includes("read ECONNRESET"))
      console.log(`successfully shutdown ${port} from ${config.replica_set_name}`);
  }
};

const removeFromSet = async (members = [], primaryPort) => {
  for (const member of members) {
    const memberPort = member.name.split(":")[1];
    await shutdownServer(memberPort);

    if (member.stateStr === "ARBITER") continue;

    const mongoCommand = `mongosh --port ${primaryPort} --eval "rs.remove('${member.name}', {force: true})"`;

    console.log(`Removing from replica set, please wait...`);
    const { stderr } = await execAsync(mongoCommand);

    if (stderr) {
      console.error(`Error removing replica set members: ${stderr}`);
      continue;
    }

    console.log(`successfully removed ${member.name} from ${config.replica_set_name}`);
  }
};

const dropLocalDatabase = async () => {
  const mongoCommand = `mongosh --port ${config.default_mongodb_port} --eval "use local; db.system.replset.remove({})"`;

  console.log(`Removing local database, please wait...`);
  const { stderr } = await execAsync(mongoCommand);

  if (stderr) {
    console.error(`Error removing local database: ${stderr}`);
  }

  console.log(`successfully removed local database`);
};

export const shutdownServers = async () => {
  try {
    const members = await getReplicaMembers();
    const replicaMembers = members?.replicaMembers;

    const nodeOptions = replicaMembers.map((member) => ({
      name: `${member.name} - ${member.stateStr}`,
      value: member._id,
      disabled: member.stateStr === "PRIMARY" || member.stateStr === "ARBITER" ? "Not Allowed" : "",
    }));

    const answers = await inquirer.prompt([
      {
        type: "checkbox",
        name: "nodes",
        message: "Select node to shutdown:",
        choices: nodeOptions,
      },
    ]);

    const selectedMembers = replicaMembers.filter((member) => answers.nodes.includes(member._id));

    for (const member of selectedMembers) {
      const memberPort = member.name.split(":")[1];
      await shutdownServer(memberPort);
    }
  } catch (error) {
    console.log("🚀 ~ shutdownServers ~ error:", error);
  }
};

const removeItemFromReplicaSet = async () => {
  try {
    const members = await getReplicaMembers();
    const replicaMembers = members?.replicaMembers;
    const primaryMember = members?.primaryMember;

    if (!primaryMember) {
      console.log("Unable to remove nodes due to no primary node");
      return;
    }

    const nodeOptions = replicaMembers.map((member) => ({
      name: `${member.name} - ${member.stateStr}`,
      value: member._id,
      disabled: member.stateStr === "PRIMARY" || member.stateStr === "ARBITER" ? "Not Allowed" : "",
    }));

    const answers = await inquirer.prompt([
      {
        type: "checkbox",
        name: "nodes",
        message: "Select node to remove:",
        choices: nodeOptions,
      },
    ]);

    const primaryPort = primaryMember.name.split(":")[1];

    await handleWriteConcern(primaryPort, false);
    await removeFromSet(
      replicaMembers.filter((member) => answers.nodes.includes(member._id)),
      primaryPort
    );
  } catch (error) {
    console.log("🚀 ~ removeReplicaSet ~ error:", error);
  }
};

export const deleteReplicaSet = async () => {
  try {
    const members = await getReplicaMembers();
    const replicaMembers = members?.replicaMembers;

    const primaryMember = members?.primaryMember;

    if (!primaryMember) {
      console.log("Unable to delete replica set due to no primary node");
      return;
    }

    const primaryPort = primaryMember.name.split(":")[1];

    await removeFromSet(
      replicaMembers.filter((member) => member.name !== primaryMember.name),
      primaryPort
    );

    await shutdownServer(primaryPort);

    await dropLocalDatabase();

    await deleteBaseDirectory();

    console.log(`successfully removed ${config.replica_set_name}`);
  } catch (error) {
    console.log("🚀 ~ deleteReplicaSet ~ error:", error);
  }
};

export default removeItemFromReplicaSet;
