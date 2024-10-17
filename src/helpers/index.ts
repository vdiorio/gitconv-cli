import { CommitInfo, ConventionalCommitTypes } from "../interfaces";
import types from "../data/types.json";
import execa from "execa";
import Fuse from "fuse.js";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";

const LAST_COMMIT_FILE = path.join(__dirname, ".gitconv_last_commit.json");

const commitError = [
  "\n",
  "Oops! An error occurred. There is likely additional logging output above.\n"
    .red,
  "You can run the same commit with this command: ".red + "gitconv -r \n".blue,
];

// Função para salvar o commit em um arquivo JSON
function saveLastCommit(lastCommit: string) {
  fs.writeFileSync(LAST_COMMIT_FILE, JSON.stringify({ lastCommit }));
}

// Função para executar o commit e salvar o último commit
export function commit(commitInfo: CommitInfo) {
  const { type, title, scope, body, footers } = commitInfo;
  const hasScope = scope !== "";
  const hasFooters = footers.length !== 0;
  try {
    const commited = execa.sync(
      "git",
      [
        "commit",
        "-m",
        `${type.trim()}${hasScope ? `(${scope})` : ""}: ${title}`,
        "-m",
        `${body.trim()}`,
        "-m",
        `${hasFooters ? `${footers.join("\n")}` : ""}`,
      ],
      {
        buffer: false,
        stdio: "inherit",
      }
    );

    saveLastCommit(commited.escapedCommand);
    process.exit(0);
    // Salvar as informações do último commit após o sucesso
  } catch (e) {
    const error = e as execa.ExecaError;
    saveLastCommit(error.escapedCommand);
    console.error(...commitError, `Command used: ${error.escapedCommand.blue}`);
    process.exit(1);
  }
}

// Função para obter o último commit
export async function retryLastCommit() {
  // Check if the last commit file exists
  if (!fs.existsSync(LAST_COMMIT_FILE)) {
    throw new Error("No last commit found");
  }

  // Read the last commit command from the file
  const data = fs.readFileSync(LAST_COMMIT_FILE, "utf-8");
  const { lastCommit } = JSON.parse(data) as { lastCommit: string };

  // Prompt the user for confirmation
  const { retry } = await inquirer.prompt([
    {
      type: "confirm",
      name: "retry",
      message: "This will run the command: ".red + lastCommit.blue,
    },
  ]);

  // If the user confirms, execute the command
  if (retry) {
    try {
      execa.sync(lastCommit, {
        buffer: false,
        stdio: "inherit",
      });
      console.log("Command executed successfully.".green);
    } catch (error) {
      const e = error as execa.ExecaError;
      console.error(...commitError, `Command used: ${e.escapedCommand.blue}`);
      process.exit(1);
    }
  } else {
    console.log("Command execution canceled.");
  }
  process.exit(0);
}

// Função para listar todas as tags no repositório git
export function listTags(): void {
  try {
    for (const type of types) {
      console.log(
        `${setDescriptionIndent(type.type).yellow.bold} : ${type.description.cyan}`
      );
    }
    process.exit(0);
  } catch (e) {
    console.error("Error fetching tags:".red, e);
    process.exit(1);
  }
}

export function setDescriptionIndent(string: string) {
  const DEFAULT_LENGTH = 8;
  let spaceDescription = string;
  while (spaceDescription.length < DEFAULT_LENGTH) {
    spaceDescription += " ";
  }
  return spaceDescription;
}

export function searchType(_answers: CommitInfo, input = "") {
  const typesChoices: ConventionalCommitTypes[] = [
    ...types,
    ...types.map((t: ConventionalCommitTypes) => ({
      type: `${t.type}!`,
      description: `${t.description} ${'("BREAKING CHANGE")'.dim}`,
    })),
  ];

  return new Promise((resolve) => {
    resolve(
      filterCommitTypes(typesChoices, input).map(({ type, description }) => ({
        name: `${setDescriptionIndent(type).yellow.bold} - ${description}`,
        value: type,
      }))
    );
  });
}

export function filterCommitTypes(
  commitTypes: Array<ConventionalCommitTypes>,
  input: string
): ConventionalCommitTypes[] {
  const options = {
    threshold: 0.5,
    keys: [
      {
        name: "type",
        weight: 0.33,
      },
      {
        name: "description",
        weight: 0.67,
      },
    ],
  };
  const fuse = new Fuse(commitTypes, options);

  return input ? fuse.search(input).map((type) => type.item) : commitTypes;
}
