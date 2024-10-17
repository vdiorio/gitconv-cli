import { retryLastCommit, listTags } from "../helpers";
import { checkForUpdates } from "../updateChecker";

export async function argsHandler() {
  const args = process.argv.slice(2); // Get the command line arguments after "node script.js"

  // Define the available commands and their corresponding functions
  const commandHandlers = {
    "-r": retryLastCommit,
    "--retry": retryLastCommit,
    "-l": listTags,
    "--list": listTags,
    "-h": showHelp,
    "--help": showHelp,
    "-u": () => checkForUpdates(true),
    "--update": () => checkForUpdates(true),
  };

  // Get the first argument (command)
  const firstArg = args[0] as keyof typeof commandHandlers;

  // Check if the command exists in the commandHandlers object
  if (commandHandlers[firstArg]) {
    return commandHandlers[firstArg](); // Execute the corresponding function
  }

  // Function to display the help message
  function showHelp() {
    console.log(
      "Usage: gitconv [options]\n\n" +
        "Options:\n" +
        "-h, --help: Show this message\n" +
        "-l, --list: List all tags\n" +
        "-r, --retry: Retry the last commit\n" +
        "-u, --update: Check for updates"
    );
    process.exit(0);
  }
}
