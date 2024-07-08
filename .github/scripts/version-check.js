const fs = require("fs");
const { execSync } = require("child_process");
const semver = require("semver");

// Read the current branch's package.json
const currentPackage = JSON.parse(fs.readFileSync("package.json", "utf8"));
const currentVersion = currentPackage.version;

// Fetch the package.json from the main branch
execSync("git fetch origin main:main");
const mainPackageJson = execSync("git show main:package.json").toString();
const mainPackage = JSON.parse(mainPackageJson);
const mainVersion = mainPackage.version;

if (semver.gt(currentVersion, mainVersion)) {
  console.log(`Version check passed: ${mainVersion} -> ${currentVersion}`);
  process.exit(0);
} else {
  console.error(`Version check failed: ${mainVersion} -> ${currentVersion}`);
  console.error("Please increment the version number in package.json");
  process.exit(1);
}
