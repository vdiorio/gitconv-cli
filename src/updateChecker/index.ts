import "colors";
import fs from "fs";
import path from "path";
import "dotenv/config";

const updateCheckFile = path.join(__dirname, "lastUpdateCheck.json");

function shouldCheckForUpdates() {
  let lastCheck = 0;

  if (fs.existsSync(updateCheckFile)) {
    lastCheck = JSON.parse(fs.readFileSync(updateCheckFile, "utf-8")).timestamp;
  }

  const now = Date.now();
  const ONE_DAY = 1000 * 60 * 60 * 24;

  if (now - lastCheck > ONE_DAY) {
    fs.writeFileSync(updateCheckFile, JSON.stringify({ timestamp: now }));
    return true;
  }

  return false;
}

export async function checkForUpdates() {
  if (shouldCheckForUpdates()) {
    try {
      const response = await fetch("https://registry.npmjs.org/gitconv");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const packageInfo = await response.json();
      const currentVersion = process.env.CURRENT_VERSION; // Get the current version from package.json
      console.log("Current Version:", currentVersion); // Debug: log current version
      const latestVersion = packageInfo["dist-tags"].latest;

      console.log("Current Version:", currentVersion); // Debug: log current version
      console.log("Latest Version:", latestVersion); // Debug: log latest version

      if (currentVersion !== latestVersion) {
        console.log(
          `A new version of gitconv is available: "${latestVersion}" You can update with: ${"npm install -g gitconv@latest".blue} \n\n`
            .yellow
        );
      }
    } catch (error) {
      console.error("Error checking for updates:", error); // Log the error message
    }
  } else {
    console.log("Update check not needed yet."); // Optional: Inform when no check is needed
  }
}
