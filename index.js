#!/usr/bin/env node

import { program } from "commander";
import shell from "shelljs";
import inquirer from "inquirer";

program
  .version("1.0.0")
  .description(
    "CLI to initialize projects from a React Native starter kit with different configurations"
  );

program
  .command("create")
  .description("Create a new project from the starter kit")
  .action(createProject);

program.parse(process.argv);

function createProject() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "projectName",
        message: "Enter the name of your new project:",
        validate: function (input) {
          if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
          else
            return "Project name may only include letters, numbers, underscores, and hashes.";
        },
      },
      {
        type: "input",
        name: "bundleId",
        message: "Enter the new bundle identifier (e.g., com.example.myapp):",
        validate: function (input) {
          if (/^[a-zA-Z0-9\.\_\-]+$/.test(input)) return true;
          else
            return "Bundle identifier may only include letters, numbers, periods, underscores, and dashes.";
        },
      },
      {
        type: "list",
        name: "branch",
        message: "Select the template configuration:",
        choices: [
          { name: "Empty (Basic Setup)", value: "main" },
          // { name: "With Components (Feature-rich)", value: "with-components" },
        ],
      },
    ])
    .then((answers) => {
      const { projectName, bundleId, branch } = answers;

      console.log(
        `Creating a new project '${projectName}' from branch '${branch}'...`
      );
      if (
        shell.exec(
          `git clone -b ${branch} https://github.com/ahmadfreijeh/quickode ${projectName}`
        ).code !== 0
      ) {
        console.error("Error: Git clone failed");
        shell.exit(1);
      } else {
        console.log(
          `Repository cloned successfully. cd into ${projectName} and install dependencies...`
        );
        shell.cd(projectName);
        if (!shell.test("-f", "package.json")) {
          console.error(
            "Error: package.json not found in the project directory."
          );
          shell.exit(1);
        }
        if (shell.exec("npm install").code !== 0) {
          console.error("Error: npm installation failed");
          shell.exit(1);
        }
        console.log("Dependencies installed successfully!");

        // Use react-native-rename to rename the project and change the bundle identifier
        if (
          shell.exec(
            `npx react-native-rename "${projectName}" -b "${bundleId}"`
          ).code !== 0
        ) {
          console.error("Error: Project renaming failed");
          shell.exit(1);
        }
        console.log(
          "Project renamed successfully and bundle identifier updated."
        );
      }
    });
}
