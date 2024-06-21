const esbuild = require("esbuild");
const fs = require("fs-extra");
const chokidar = require("chokidar");
const { exec } = require("child_process");
const { stdout, stderr } = require("process");
const { error } = require("console");

// copy static files
async function copyStaticFiles() {
  await fs.copy("src/index.html", "dist/index.html");
  await fs.copy("src/style.css", "dist/style.css");
  await fs.copy("src/assets", "dist/assets");
  console.log("Static files copied");
}

// Build and copy
async function initialBuild() {
  await esbuild.build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    sourcemap: true,
    outfile: "dist/bundle.js",
    target: ["es2022"],
    format: "esm"
  });
  await copyStaticFiles();
  console.log("Initial build complete");
}

// Watch
chokidar.watch("src/**/*").on("all", (event, path) => {
  console.log(`${path} changed. Rebuilding...`);
  if (path.endsWith(".ts")) {
    initialBuild();
  } else if (path.endsWith(".html") || path.endsWith(".css")) {
    copyStaticFiles();
  }
});

// Start dev server
exec("npx serve dist", (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(stdout);
  console.error(stderr);
});

initialBuild();