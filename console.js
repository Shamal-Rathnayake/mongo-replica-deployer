import inquirer from "inquirer";
import createConfigurations from "./src/generateConfig.js";
import deployAllDatabases from "./src/deployDatabases.js";
import initiateReplicaSet from "./src/initiateReplicaSet.js";
import removeItemFromReplicaSet, {
  deleteReplicaSet,
  shutdownServers,
} from "./src/removeReplicaset.js";

const menuOptions = [
  "Create Configuration Files",
  "Deploy Databases",
  "Initiate Replica Set",
  "Shutdown Nodes from Replica Set",
  "Remove Nodes from Replica Set",
  "Delete Replica Set",
  "Exit",
];

const createConfigFiles = async () => {
  console.log("Creating configuration files...");
  await createConfigurations();
};

const deployDatabases = async () => {
  console.log("Deploying databases...");
  await deployAllDatabases();
};

const initiateReplicaSets = async () => {
  console.log("Initiating replica set...");
  await initiateReplicaSet();
};

const shutdownNodesFromReplicaSet = async () => {
  console.log("Shutting down nodes from replica set...");
  await shutdownServers();
};

const removeNodesFromReplicaSet = async () => {
  console.log("Removing nodes from replica set...");
  await removeItemFromReplicaSet();
};

const delete_ReplicaSet = async () => {
  console.log("Removing replica set...");
  await deleteReplicaSet();
};

const mainMenu = async () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "menu",
        message: "\nPlease choose an option:",
        choices: menuOptions,
      },
    ])
    .then(async (answer) => {
      switch (answer.menu) {
        case "Create Configuration Files":
          await createConfigFiles();
          break;
        case "Deploy Databases":
          await deployDatabases();
          break;
        case "Initiate Replica Set":
          await initiateReplicaSets();
          break;
        case "Shutdown Nodes from Replica Set":
          await shutdownNodesFromReplicaSet();
          break;
        case "Remove Nodes from Replica Set":
          await removeNodesFromReplicaSet();
          break;
        case "Delete Replica Set":
          await delete_ReplicaSet();
          break;
        case "Exit":
          console.log("Exiting...");
          process.exit();
          break;
        default:
          console.log("Invalid option. Please try again.");
          break;
      }

      // Show menu again after the action is completed
      //mainMenu();
    });
};

mainMenu();
