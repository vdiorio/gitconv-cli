const { version } = require("./package.json");
const fs = require("fs");

fs.writeFileSync(
  "src/updateChecker/version.ts",
  `export const version = "${version}";`
);
